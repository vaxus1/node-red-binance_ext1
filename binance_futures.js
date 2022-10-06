module.exports = function (RED) {

  function getFuturesBalanceNode(n) {
    RED.nodes.createNode(this,n);
    var node = this;
    node.status({});
    node.binance = RED.nodes.getNode(n.binance);

    node.on('input', function (msg) {
      if (!node.binance) {
        node.error(RED._("binance.errors.missing-conf"), msg);
        return;
      }

      updateBinanceConfig(node.binance, function () {
        var binance = node.binance ? node.binance.binance: null;
        binance.futuresBalance(function (err, balances) {
          if (err) {
            var errorMsg = parseApiError(err);
            node.error(errorMsg, msg);
            node.status({fill: "red", shape: "ring", text: errorMsg});
            return;
          }
          node.status({}); //clear status message
          msg.payload = filterNonZeroBalance(balances);
          node.send(msg);
        });
      });
    });
  }
  // Public APIs

  // Account APIs (require credentials)

  RED.nodes.registerType("binance-get-futures-balance", getFuturesBalanceNode);

};
