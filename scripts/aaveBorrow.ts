import { ethers, getNamedAccounts } from 'hardhat'
import { AMOUNT, getWeth } from './getWeth'
import { AddressLike, BigNumberish } from 'ethers'
import { ILendingPool } from '../typechain-types'

const main = async () => {
    await getWeth()
    const { deployer } = await getNamedAccounts()
    const lendingPool = await getLendingPool()
    console.log(`LendingPool address ${await lendingPool.getAddress()}`)
    const wethTokenAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
    await approveERC20(wethTokenAddress, lendingPool.getAddress(), AMOUNT)
    console.log('Depositing...')
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
    console.log('Deposited')
    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(lendingPool, deployer)
    const daiPrice = await getDAIPrice()
    const amountDAIToBorrow = Number(availableBorrowsETH) * 0.95 * (1 / Number(daiPrice))
    console.log(`You can borrow ${amountDAIToBorrow} DAI`)
    const amountDAIToBorrowWei = ethers.parseEther(amountDAIToBorrow.toString())
    const daiTokenAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    await borrowDai(daiTokenAddress, lendingPool, amountDAIToBorrowWei, deployer)
    await getBorrowUserData(lendingPool, deployer)
    await repay(amountDAIToBorrowWei, daiTokenAddress, lendingPool, deployer)
    await getBorrowUserData(lendingPool, deployer)
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
    amountToSpend: BigNumberish
) => {
    const erc20Token = await ethers.getContractAt('IERC20', erc20Address)
    const tx = await erc20Token.approve(spenderAdress, amountToSpend)
    await tx.wait(1)
    console.log('Approved!')
}

const getBorrowUserData = async (lendingPool: ILendingPool, account: string) => {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account)
    console.log(`You have ${totalCollateralETH} worth of ETH deposited.`)
    console.log(`You have ${totalDebtETH} worth of ETH borrowed.`)
    console.log(`You can borrow ${availableBorrowsETH} ETH.`)
    return { availableBorrowsETH, totalDebtETH }
}

const getDAIPrice = async () => {
    const daiETHPriceFeed = await ethers.getContractAt(
        'AggregatorV3Interface',
        '0x773616E4d11A78F511299002da57A0a94577F1f4'
    )
    const price = (await daiETHPriceFeed.latestRoundData())[1]
    console.log(`The DAI/ETH price is ${price.toString()}`)
    return price
}

const borrowDai = async (
    daiAddress: AddressLike,
    lendingPool: ILendingPool,
    amountDAIToBorrowWei: BigNumberish,
    account: AddressLike
) => {
    const borrowTx = await lendingPool.borrow(daiAddress, amountDAIToBorrowWei, 2, 0, account)
    console.log('got here')
    await borrowTx.wait(1)
    console.log(`You've borrowed!`)
}

const repay = async (
    amount: BigNumberish,
    daiAddress: string,
    lendingPool: ILendingPool,
    account: AddressLike
) => {
    await approveERC20(daiAddress, lendingPool.getAddress(), amount)
    const repayTx = await lendingPool.repay(daiAddress, amount, 2, account)
    await repayTx.wait(1)
    console.log('Repayed')
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
