async function saveOptions () {
  try {
    const emails = document.getElementById('emails').value.split('\n').map(x => x.trim()).filter(x => x)
    await browser.storage.local.set({ forwardingAddresses: emails })
  } catch (e) {
    console.error(e)
    document.getElementById('error').innerText = `Saving options failed! ${e}`
  }

  document.getElementById('error').innerHTML = '<span style="color: green;">Saved!</span>'
}

async function restoreOptions () {
  try {
    const { forwardingAddresses } = await browser.storage.local.get({ forwardingAddresses: [] })
    document.getElementById('emails').value = forwardingAddresses.join('\n')
  } catch (e) {
    console.error(e)
    document.getElementById('error').innerText = `Loading options failed! ${e}`
  }
}

document.addEventListener('DOMContentLoaded', restoreOptions)
document.getElementById('save').addEventListener('click', saveOptions)
