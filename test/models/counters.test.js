"use strict";

var should = require('should')
  , dbService = require('../../app/models/dbService')
  , env = require('../../conf/config').env
  , counters = require('../../app/models/counters');


describe('counters', function() {
  var countersCollection;
  var db;
  before(function(done) {
    db = dbService.init();
    db.once('connected', function(err, pdb) {
      db = pdb;
      db.setCounters(env.MONGODB_COLLECTION_COUNTERS + '_test');
      countersCollection = db.counters;
      counters.init(db);
      done();
    });
  });
  after(function() {
    countersCollection.remove(function(err, numberOfRemovedDocs) {
      should.not.exist(err);
      should.exist(numberOfRemovedDocs);
    });
    db.db.close();
    db.db = null;
  });
  describe('시퀀스 관리', function() {
    it('최초 생성시 questionId의 시퀀스 번호는 1 이다', function(done) {
      // given
      // when
      counters.getNextSequence("questionId", function(err, seq) {
        // then
        should.not.exist(err);
        seq.should.equal(1);
        done();
      });
    });
    it('questionId의 다음 시퀀스 번호를 가져온다', function(done) {
      // given
      counters.getNextSequence("questionId", function(err, seq) {
        // when
        var beforeSeq = seq;
        counters.getNextSequence("questionId", function(err, afterSeq) {
          // then
          should.not.exist(err);
          afterSeq.should.equal(beforeSeq + 1);
          done();
        });
      });
    });
  });
});