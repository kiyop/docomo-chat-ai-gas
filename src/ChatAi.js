(function(global) {
  global.DocomoChatAi = (function() {
    function DocomoChatAi(config) {
      if (typeof config == 'string') {
        config = { apiKey: config };
      }
      this.baseUrl = config.baseUrl || 'https://api.apigw.smt.docomo.ne.jp';
      this.apiKey = config.apiKey;
      this.headers = {};
    };

    DocomoChatAi.prototype.snakeToCamel_ = function(s) {
      return s.replace(/(_\w)/g, function(m) {
        return m[1].toUpperCase();
      });
    };

    DocomoChatAi.prototype.toObject_ = function(src) {
      if (typeof src !== 'object' || Array.isArray(src)) {
        return src;
      }
      var dst = {};
      for (var key in src) {
        dst[this.snakeToCamel_(key)] = this.toObject_(src[key])
      }
      return dst;
    };

    DocomoChatAi.prototype.sendRequest_ = function(method, url, query, payload) {
      query['APIKEY'] = this.apiKey;
      var opt = {
        'method': method,
        'headers': this.headers,
        'muteHttpExceptions': true,
      };
      if (method == 'post' && payload) {
        opt['contentType'] = 'application/json; charset=utf-8';
        opt['payload'] = JSON.stringify(payload);
      }

      var p = [];
      for (var k in query) {
        p.push(encodeURIComponent(k) + '=' + encodeURIComponent(query[k]));
      }
      var res = UrlFetchApp.fetch(url + '?' + p.join('&'), opt);
      if (res && res.getResponseCode() == 200) {
        try {
          return this.toObject_(JSON.parse(res.getContentText()));
        } catch(error) {}
      }
      return false;
    };

    DocomoChatAi.prototype.get_ = function(url, query) {
      return this.sendRequest_('get', url, query, {});
    };

    DocomoChatAi.prototype.post_ = function(url, query, payload) {
      return this.sendRequest_('post', url, query, payload);
    };

    // 雑談対話
    DocomoChatAi.prototype.chat = function(message, contextId, options) {
      options = options || {};
      var payload = {};
      for (var i in options) {
        payload[i] = options[i];
      }
      payload['utt'] = message;
      if (contextId) {
        payload['context'] = contextId;
      }
      return this.post_(this.baseUrl + '/dialogue/v1/dialogue', {}, payload);
    }

    // 知識 Q & A
    DocomoChatAi.prototype.ask = function(question) {
      return this.get_(this.baseUrl + '/knowledgeQA/v1/ask', { 'q': question });
    }

    return DocomoChatAi;
  })();
})(this);

function factory(config) {
  return new DocomoChatAi(config);
};

