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
	  const messagedelete = await get_config("maildelete");
	  const setjunk = await get_config("setjunk");
	  
	  if (message.recipient.includes("@")) {
		  const tab = await browser.compose.beginForward(messageId, "forwardAsAttachment", {
			"to": [message.recipient],
			"identityId": identityId
		  });

		  if (!message.compose) {
			await new Promise(resolve => setTimeout(resolve, 1500));
			console.log('Sent:', await browser.compose.sendMessage(tab.id));
		  }
		  
		  if (setjunk == 1) {
				console.log("setting message #"+messageId+" as junk");
				await browser.messages.update(messageId, {junk: true});
				await new Promise(resolve => setTimeout(resolve, 500));			  
		  }
		  if (messagedelete == 1) {
			  console.log("deleting message #"+messageId);
			  await browser.messages.delete([messageId]);
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


async function get_config(key) {
	let prefs = await browser.storage.local.get();
	for (let configKey of Object.keys(prefs)) {
		
		console.log("key("+configKey+") = value("+prefs[configKey]+")");

		if (configKey == key) {
			return prefs[configKey];
		}
	}
	return null;
}

/**
 * Returns the trash folder of the account a given message belongs to. The
 * accountsRead permission is required.
 */
async function getTrashFolderForMessage(msgId) {
    let msg = await messenger.messages.get(msgId);
    let account = await messenger.accounts.get(msg.folder.accountId);
	let folderPromise = account.folders.find(folder => folder.type == "trash");
	let TrashFolder = null;
	folderPromise.then((response) => {
		TrashFolder = response;
	});
	console.log("getTrashFolderForMessage:"+folderPromise);
    return TrashFolder;
}