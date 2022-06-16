const Uint8ArrayToString = (fileData: Uint8Array) => {
  let dataString = ""
  for (var i = 0; i < fileData.length; i++) {
    dataString += String.fromCharCode(fileData[i])
  }

  return dataString
}
export default Uint8ArrayToString
