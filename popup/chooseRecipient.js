async function buildRecipientsList () {
  try {
    const { forwardingAddresses } = await browser.storage.local.get({ forwardingAddresses: [] })

    var addressArray = [];
    addressArray.push("is-spam@labs.sophos.com");
    addressArray.push("spam@antispamgateway.comodo.com");
    

    if (forwardingAddresses.length) {
      addressArray.push(forwardingAddresses);
    }

    for (const addressString of addressArray) {
      const option = document.createElement('button')
      const [, name, address] = addressString.match(/(.*)\s*<(.*)>/) ?? [null, null, addressString]
      option.innerText = name?.replace(/^"|"$/g, '') ?? address
      if (name) option.title = address
      option.addEventListener('click', e => {
        try {
          browser.runtime.sendMessage({ action: 'chooseRecipient', recipient: addressString, compose: e.shiftKey })
          window.close()
        } catch (e) {
          console.error(e)
          document.getElementById('error').innerText = `Sending message failed! ${e}`
        }
      })
      document.getElementById('recipients').appendChild(option)
    }
  } catch (e) {
    console.error(e)
    document.getElementById('error').innerText = `Loading options failed! ${e}`
  }
}

document.addEventListener('DOMContentLoaded', buildRecipientsList)
