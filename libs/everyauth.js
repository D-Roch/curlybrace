var everyauth = require('everyauth')
  , conf = require('../conf/authconf')
  , CONST = require('../conf/constant')
  , authManager = require('./authManager')
  , Promise = everyauth.Promise
  , http = require('http')
  , util = require('util')
  , AuthOriginEnum = require('../conf/enums').AuthOriginEnum;

module.exports = {
    init: function(db ) {
      everyauth.debug = true;

      this.enableFacebook();
      this.enableTwitter();
      this.enableGoogle();

      return everyauth;
    }
  , enableFacebook: function() {
      everyauth.facebook
      .appId(conf.facebook.appId)
      .appSecret(conf.facebook.appSecret)
      .findOrCreateUser( function (session, accessToken, accessTokenExtra, fbUserMetadata) {
        clog.debug('session: ' + util.inspect(session));
        clog.debug('accessToken: ' + util.inspect(accessToken));
        clog.debug('accessTokenExtra: ' + util.inspect(accessTokenExtra));
        clog.debug('fbUserMetadata: ' + util.inspect(fbUserMetadata));
        var promise = this.Promise();
        authManager.findAcountBy(fbUserMetadata.id, AuthOriginEnum.facebook, function(err, user) {
          if (err) return promise.fail(err);
          if (user) {
            promise.fulfill(user);
          } else {
            authManager.addNewAcount(fbUserMetadata, AuthOriginEnum.facebook, function(err, insertedUser) {
              promise.fulfill(insertedUser);
            });
          }
        });
        return promise;
      })
      .redirectPath('/');
    }
  , enableTwitter: function() {
      everyauth.twitter
      .consumerKey(conf.twitter.consumerKey)
      .consumerSecret(conf.twitter.consumerSecret)
      .findOrCreateUser( function (session, accessToken, accessTokenSecret, twitterUserMetadata) {
        clog.debug('session: ' + util.inspect(session));
        clog.debug('accessToken: ' + util.inspect(accessToken));
        clog.debug('accessTokenSecret: ' + util.inspect(accessTokenSecret));
        clog.debug('twitterUserMetadata: ' + util.inspect(twitterUserMetadata));
        var promise = this.Promise();
        authManager.findAcountBy(twitterUserMetadata.id, AuthOriginEnum.twitter, function (err, user) {
          if (err) return promise.fail(err);
          if (user) {
            promise.fulfill(user);
          } else {
            authManager.addNewAcount(twitterUserMetadata, AuthOriginEnum.twitter, function(err, insertedUser) {
              promise.fulfill(insertedUser);
            });
          }
        });
        return promise;
      })
      .redirectPath('/');
    }
  , enableGoogle: function() {
      everyauth.google
      .appId(conf.google.clientId)
      .appSecret(conf.google.clientSecret)
      .scope('https://www.google.com/m8/feeds/')
      .findOrCreateUser( function (session, accessToken, accessTokenExtra, googleUserMetaData) {
        clog.debug('session: ' + util.inspect(session));
        clog.debug('accessToken: ' + util.inspect(accessToken));
        clog.debug('accessTokenExtra: ' + util.inspect(accessTokenExtra));
        clog.debug('googleUserMetaData: ' + util.inspect(googleUserMetaData));
        var promise = this.Promise();
        authManager.findAcountBy(googleUserMetaData.id, AuthOriginEnum.google, function (err, user) {
          if (err) return promise.fail(err);
          if (user) {
            promise.fulfill(user);
          } else {
            authManager.addNewAcount(googleUserMetaData, AuthOriginEnum.google, function(err, insertedUser) {
              promise.fulfill(insertedUser);
            });
          }
        });
        return promise;
      })
      .redirectPath('/');
    }
}
