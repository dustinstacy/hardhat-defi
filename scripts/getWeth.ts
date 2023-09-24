import { ethers, getNamedAccounts } from 'hardhat'

const AMOUNT = ethers.parseEther('0.02')

export const getWeth = async () => {
    const { deployer } = await getNamedAccounts()
    // 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
    const iWeth = await ethers.getContractAt('IWeth', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
    const tx = await iWeth.deposit({ value: AMOUNT })
    await tx.wait(1)
    const wethBalance = await iWeth.balanceOf(deployer)
    console.log(`Got ${wethBalance.toString()}`)
}
