import { ethers, getNamedAccounts } from 'hardhat'
import { getWeth } from './getWeth'

const main = async () => {
    await getWeth()
    const lendingPool = await getLendingPool()
    console.log(`LendingPool address ${await lendingPool.getAddress()}`)
}

const getLendingPool = async () => {
    const lendingPoolAddressProvider = await ethers.getContractAt(
        'ILendingPoolAddressesProvider',
        '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5'
    )
    const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt('ILendingPool', lendingPoolAddress)
    return lendingPool
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
