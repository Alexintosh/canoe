'use strict'
angular.module('canoeApp.services')
  .factory('raiblocksService', function ($log) {
    var root = {}

    // var host = 'http://localhost:7076' // for local testing against your own rai_wallet or node
    var host = 'https://getcanoe.io/rpc' // for the beta node
    var port = 443
    var rai = new Rai(host, port) // connection

    // Initialization global variables
    rai.initialize()

    root.isValidSeed = function (seedHex) {
      var isValidHash = /^[0123456789ABCDEF]+$/.test(seedHex)
      return (isValidHash && (seedHex.length === 64))
    }

    root.isValidAccount = function (addr, cb) {
      $log.debug('Validating addr: ' + addr)
      if (!addr.startsWith('xrb_')) {
        return false
      }
      return rai.account_validate(addr)
    }

    root.createWallet = function () {
      $log.debug('Create wallet')
      var wallet = {}
      wallet.id = rai.wallet_create()
      wallet.accounts = {}
      $log.debug('Wallet: ' + JSON.stringify(wallet))
      return wallet
    }

    root.makeAccount = function (wallet, id, accountName) {
      // TODO fix unique naming of discovered accounts
      var name = accountName || 'Unknown account'
      var account = {name: name, id: id}
      wallet.accounts[id] = account
      return account
    }

    root.createAccount = function (wallet, accountName) {
      $log.debug('Create account in wallet ' + wallet.id + ' named ' + accountName)
      var id = rai.account_create(wallet.id, true) // work = true
      var account = root.makeAccount(wallet, id, accountName)
      $log.debug('Account: ' + JSON.stringify(account))
      return account
    }

    root.fetchAccountsAndBalances = function (wallet, cb) {
      $log.debug('Fetch all balances in wallet ' + wallet.id)
      // This could discover new ones, or some have been removed
      var accountIds = rai.account_list(wallet.id)
      if (accountIds) {
        var balances = rai.accounts_balances(accountIds)
      }
      cb(null, balances)
    }

    root.changeSeed = function (walletId, seed) {
      $log.debug('Changing seed: ' + seed)
      if (root.isValidSeed(seed)) {
        return rai.wallet_change_seed(walletId, seed)
      }
    }

    /*
    // Version
    var ver = rai.node_vendor()
    $log.debug('Version: ' + ver)

    var key = rai.account_key(addr)
    $log.debug('Key: ' + key)

    var info = rai.account_info(addr)
    $log.debug('Info: ' + JSON.stringify(info))
    */
    return root
  })
