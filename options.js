async function saveOptions () {
	let bMailDelete = 0;
	
	try {
		const emails = document.getElementById('forwardingAddresses').value.split('\n').map(x => x.trim()).filter(x => x);

		if (document.getElementById('maildelete').checked) {
			bMailDelete = 1;
		}
	
		await browser.storage.local.set({ "forwardingAddresses": emails, "maildelete": bMailDelete });
	
	} catch (e) {
		console.error(e);
		document.getElementById('error').innerText = `Saving options failed! ${e}`;
	}

	document.getElementById('error').innerHTML = '<span style="color: green;">Options saved successfully!</span>';
}

async function restore_options() {
	let prefs = await browser.storage.local.get();
	for (let key of Object.keys(prefs)) {
		let elem = document.getElementById(key);
		
		if (!elem) continue;
		
		if (elem.type == "checkbox") {
			elem.checked = prefs[key];
		} else if (elem.getAttribute("type") == "radio") {
			let item = document.querySelector(`input[type='radio'][name='${elem.id}'][value='${prefs[key]}']`);
			item.checked = true;
		} else if (elem.type == "textarea") {
			elem.value = prefs[key].join('\n');
		} else {
			elem.value = prefs[key];
		}
	}
}

document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById('save').addEventListener('click', saveOptions);
