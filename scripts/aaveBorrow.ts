import { getWeth } from './getWeth'

const main = async () => {
    await getWeth()
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
