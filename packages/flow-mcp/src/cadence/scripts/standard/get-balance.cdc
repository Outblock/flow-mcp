import "FungibleToken"
import "FlowToken"

access(all) fun checkFlowTokenBalance(address: Address) : UFix64 {
    let account = getAccount(address)
    let vaultRef = account.capabilities
      .borrow<&{FungibleToken.Balance}>(/public/flowTokenBalance)
        ?? nil

    if vaultRef != nil {
        return vaultRef!.balance
    }

    return 0.0
}

access(all) fun main(address: Address): UFix64 {
    return checkFlowTokenBalance(address: address)
}