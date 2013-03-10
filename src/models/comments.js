// # 댓글 관련 모델
//
// Copyright (c) 2013 JeongHoon Byun aka "Outsider", <http://blog.outsider.ne.kr/>
// Licensed under the MIT license.
// <http://outsider.mit-license.org/>
"use strict";
// Module dependencies.
var helpers = require('./helpers')
  , env = require('../../src/conf/config').env
  , tags = require('./tags')
  , counters = require('./counters')
  , markdown = require('markdown').markdown
  , logger = require('../../src/conf/config').logger;

module.exports = (function() {
  var comments = null;

  // 컬렉션 인스턴스 할당 여부
  var isInited = function(callback) {
    logger.debug('comments.isInited');
    if (comments) {
      return true;
    } else {
      callback(new Error('comments collection should not be null.'));
      return false;
    }
  };

  return {
    // 컬렉션 인스턴스 할당
    init: function(db) {
      logger.debug('comments.init');
      comments = db.comments;
    },
    // 질문에 답변을 추가한다.
    // * idObj -> { questionId: questionId, answerId: answerId }
    insert: function(idObj, comment, user, callback) {
      logger.debug('comments.insert', {idObj: idObj, comment: comment, user: user});
      if (!isInited(callback)) { return false; }

      // validation
      // * 사용자 정보가 존재해야 한다.
      // * questionId는 숫자타입이어야 한다
      if (!user) { callback(new Error('user must be exist.')); return; }
      idObj.questionId = parseInt(idObj.questionId, 10);
      if (isNaN(idObj.questionId)) {
        callback(new Error('questionId must be number or convertable to number'));
        return;
      }

      // 답변에 필요한 필드 생성
      comment.id = helpers.generateUUID();
      comment.regDate = new Date();
      // 사용자 정보 복사
      comment.author = {};
      comment.author.id = user._id;
      comment.author.nickname = user.nickname;
      comment.author.profileImage = user.authInfo[user.defaultProvider].profileImage;

      // 답변에 대한 댓글
      if (idObj.answerId) {
        comments.findOne({
          _id: idObj.questionId,
          answerId: idObj.answerId
        }, function(err, foundQuestion) {
          if (err) { callback(new Error(err)); return false;}

          if (foundQuestion) {
            comments.update({
              _id: idObj.questionId,
              answerId: idObj.answerId
            }, {$push: {comments: comment}}, callback);
          } else {
            comments.insert({
              _id: idObj.questionId,
              answerId: idObj.answerId,
              comments: [comment]
            }, callback);
          }
        });
        // 질문에 대한 댓글
      } else {
        comments.findOne({_id: idObj.questionId, answerId: null}, function(err, foundQuestion) {
          if (err) { callback(new Error(err)); return false;}

          if (foundQuestion) {
            comments.update(
              {_id: idObj.questionId},
              {$push: {comments: comment}},
              callback
            );
          } else {
            comments.insert({
              _id: idObj.questionId,
              comments: [comment]
            }, callback);
          }
        });
      }

    }
  };
})();

