async function buildRecipientsList () {
	try {
		var addressArray = [];	  
		const { forwardingAddresses } = await browser.storage.local.get({ forwardingAddresses: [] })

		// predefined recipients
		addressArray.push("SOPHOS <is-spam@labs.sophos.com>");
		addressArray.push("XCITING <spam@antispamgateway.comodo.com>");
		addressArray.push("Microsoft <junk@office365.microsoft.com>");
	
		// configured recipients
		if (forwardingAddresses.length) {
			for (const addressString of forwardingAddresses) {
				addressArray.push(addressString);
			}
		}

		for (const addressString of addressArray) {
			const option = document.createElement('button');
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
			});
			document.getElementById('recipients').appendChild(option);
		}
	} catch (e) {
		console.error("error: "+e)
		document.getElementById('error').innerText = `Loading options failed! ${e}`
	}
}

document.addEventListener('DOMContentLoaded', buildRecipientsList)
