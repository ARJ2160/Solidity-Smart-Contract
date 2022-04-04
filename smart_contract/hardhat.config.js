require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: "0.8.0",
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/BPhpYxGXUphp4nYZYtkl34JB6UEN7LgO',
      accounts: ['68c23f7488c9d59a92743f478b345df8d02df8156da4670d43986041ad54874d']
    }
  }
}