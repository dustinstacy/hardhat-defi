import { ethers, getNamedAccounts } from 'hardhat'
import { AMOUNT, getWeth } from './getWeth'
import { AddressLike, BigNumberish } from 'ethers'

const main = async () => {
    await getWeth()
    const { deployer } = await getNamedAccounts()
    const lendingPool = await getLendingPool()
    console.log(`LendingPool address ${await lendingPool.getAddress()}`)
    const wethTokenAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
    await approveERC20(wethTokenAddress, lendingPool.getAddress(), AMOUNT, deployer)
    console.log('Depositing...')
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
    console.log('Deposited')
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

const approveERC20 = async (
    erc20Address: string,
    spenderAdress: AddressLike,
    amountToSpend: BigNumberish,
    account: string
) => {
    const erc20Token = await ethers.getContractAt('IERC20', erc20Address)
    const tx = await erc20Token.approve(spenderAdress, amountToSpend)
    await tx.wait(1)
    console.log('Approved!')
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
