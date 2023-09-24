import { Network } from 'hardhat/types'

export interface DeployInterface {
    getNamedAccounts: () => Promise<{
        [name: string]: string
    }>
    network: Network
}

interface networkConfigItem {
    vrfCoordinatorV2?: string
    entranceFee?: bigint
    gasLane?: string
    subscriptionId?: string
    callbackGasLimit?: string
    interval?: number
    blockConfirmations?: number
    contractAddress?: string
}

export interface networkConfigInfo {
    [key: string]: networkConfigItem
}
