import "EVM"

access(all) fun main(address: Address): String {
  let account = getAuthAccount<auth(Storage) &Account>(address)

  let coa = account.storage.borrow<&EVM.CadenceOwnedAccount>(
    from: /storage/evm
  )

  if coa == nil { 
    return ""
  } else {
    let coaAddr = coa?.address() 

    let addrByte: [UInt8] = []

    for byte in coaAddr?.bytes! {
      addrByte.append(byte)
    }

    return String.encodeHex(addrByte)
  }
}