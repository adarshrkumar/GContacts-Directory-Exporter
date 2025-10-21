function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

window.queueExport = async function() {
    try {
        console.log('Starting Google Contacts export...');

        // Initialize storage
        window.exportedContactsStorage = new Set();

        // Find the scrollable container
        const scroller = document.querySelector('.My2mLb');
        if (!scroller) {
            throw new Error('Scrollable container not found. Make sure you are on the Google Contacts directory page.');
        }

        // Find the contacts container
        const contactsContainer = document.querySelector('.ZvpjBb.C8Dkz');
        if (!contactsContainer) {
            throw new Error('Contacts container not found. Make sure you are viewing the directory/contacts list.');
        }

        let iterationCount = 0;
        let previousContactCount = 0;
        let noChangeCount = 0;

        console.log('Beginning scroll and extraction...');

        while (scroller.scrollHeight - scroller.scrollTop > scroller.clientHeight) {
            iterationCount++;

            // Extract contacts from current view
            const contactElements = contactsContainer.querySelectorAll('.XXcuqd');

            if (contactElements.length === 0) {
                console.warn('No contact elements found in iteration', iterationCount);
            }

            for (let element of contactElements) {
                try {
                    if (!element.firstChild || element.firstChild.childNodes.length <= 1) {
                        continue;
                    }

                    const name = element.firstChild.childNodes[1]?.innerText || '';
                    const job = element.firstChild.childNodes[2]?.innerText || '';
                    const email = element.firstChild.childNodes[3]?.innerText || '';
                    const phone = element.firstChild.childNodes[4]?.innerText || '';

                    window.exportedContactsStorage.add(JSON.stringify({
                        name: name,
                        job: job,
                        email: email,
                        phone: phone
                    }));
                } catch (err) {
                    console.warn('Error extracting contact data:', err);
                }
            }

            // Check if we're making progress
            const currentContactCount = window.exportedContactsStorage.size;
            if (currentContactCount === previousContactCount) {
                noChangeCount++;
                if (noChangeCount >= 3) {
                    console.log('No new contacts found in last 3 iterations. Stopping.');
                    break;
                }
            } else {
                noChangeCount = 0;
            }
            previousContactCount = currentContactCount;

            // Scroll to next section
            scroller.scrollTo({
                top: scroller.scrollTop + scroller.clientHeight,
                behavior: 'smooth'
            });

            const progress = (scroller.scrollTop / scroller.scrollHeight * 100).toFixed(1);
            console.log(
                `Iteration ${iterationCount}: ${scroller.scrollTop}/${scroller.scrollHeight} (${progress}%) - ` +
                `${currentContactCount} contacts collected`
            );

            await sleep(4000);
        }

        // Final extraction at the bottom
        const finalContactElements = contactsContainer.querySelectorAll('.XXcuqd');
        for (let element of finalContactElements) {
            try {
                if (!element.firstChild || element.firstChild.childNodes.length <= 1) {
                    continue;
                }

                const name = element.firstChild.childNodes[1]?.innerText || '';
                const job = element.firstChild.childNodes[2]?.innerText || '';
                const email = element.firstChild.childNodes[3]?.innerText || '';
                const phone = element.firstChild.childNodes[4]?.innerText || '';

                window.exportedContactsStorage.add(JSON.stringify({
                    name: name,
                    job: job,
                    email: email,
                    phone: phone
                }));
            } catch (err) {
                console.warn('Error extracting contact data:', err);
            }
        }

        console.log('Export complete!');
        console.log(`Total contacts collected: ${window.exportedContactsStorage.size}`);
        console.log('Access data via: Array.from(window.exportedContactsStorage).map(item => JSON.parse(item))');

        return {
            success: true,
            count: window.exportedContactsStorage.size
        };

    } catch (error) {
        console.error('Export failed:', error);
        throw error;
    }
}