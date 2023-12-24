async function getMessageId () {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true })
  const tabId = tabs[0].id
  const message = await browser.messageDisplay.getDisplayedMessage(tabId)
  return message.id
}

async function getIdentityIdForMessage(messageId) {
  const messageHeader = await browser.messages.get(messageId)
  const account = await browser.accounts.get(messageHeader.folder.accountId)
  const identity = account.identities.find(id => messageHeader.recipients.some(r => r === id.email || r.replace(/^.*<|>.*$/g, '') === id.email))

  return (identity ?? await browser.identities.getDefault(account.id)).id
}

browser.runtime.onMessage.addListener(async (message) => {
  if (message.action === 'chooseRecipient') {
    try {
      const messageId = await getMessageId();
      const identityId = await getIdentityIdForMessage(messageId);
	  const bAttachment = false;
	  
	  if (message.recipient.includes("@")) {
		  const tab = await browser.compose.beginForward(messageId, "forwardAsAttachment", {
			"to": [message.recipient],
			"identityId": identityId
		  });
		  console.log(`Forwarding window opened with tabId: ${tab.id}`)

		  if (!message.compose) {
			await new Promise(resolve => setTimeout(resolve, 1500)) // Fails if called to quickly after beginForward!
			console.log('Sent:', await browser.compose.sendMessage(tab.id))
		  }		  
	  }


	  
    } catch (e) {
      console.error(e)
      browser.notifications.create({
        "type": "basic",
        "title": "Forwarding failed!",
        "message": String(e)
      })
    }
  }
})
