async function buildRecipientsList () {
  try {
    const { forwardingAddresses } = await browser.storage.local.get({ forwardingAddresses: [] })

    if (!forwardingAddresses.length) {
      document.getElementById('recipients').innerText = 'No forwarding addresses configured! Go to extension settings to add some.'
      document.getElementById('recipients').style.fontWeight = 'bold'
      return
    }

    for (const addressString of forwardingAddresses) {
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
