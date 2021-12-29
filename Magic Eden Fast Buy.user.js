// ==UserScript==
// @name         Magic Eden Fast Buy
// @namespace    https://github.com/PatrykXDD
// @version      0.1
// @description  take over Magic Eden with a single click.
// @author       https://twitter.com/kyrtap1_
// @match        https://magiceden.io/*
// @icon         https://www.google.com/s2/favicons?domain=magiceden.io
// @grant GM_setValue
// @grant GM_deleteValue
// @grant GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    let IS_AUTOBUY_ENABLED;
    const settings = GM_getValue('MEFastbuy');
    if (settings == undefined) {
        GM_setValue('MEFastbuy', JSON.stringify({enabled: false}))
        IS_AUTOBUY_ENABLED = false;
    } else {
        const parsed = JSON.parse(settings);
        IS_AUTOBUY_ENABLED = parsed.enabled;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function callback() {
        const isMarketplace = location.href.match(/^https:\/\/magiceden.io\/marketplace\/*/);
        const isItemDetails = location.href.match(/^https:\/\/magiceden.io\/item-details\/*/);
        if (isMarketplace !== null) {
            await handleNftPage();
        }
        if (isItemDetails !== null) {
            await autoBuy();
        }
    }

    document.addEventListener("DOMContentLoaded", async function () {
        const isMainPage = location.href.match(/^https:\/\/magiceden.io\/$/);
        const isMarketplace = location.href.match(/^https:\/\/magiceden.io\/marketplace\/*/);
        const isItemDetails = location.href.match(/^https:\/\/magiceden.io\/item-details\/*/);
        if (isMainPage !== null) {
            var target = document.querySelector('body');
            var observer = new MutationObserver(callback);
            var config = { attributes: true, childList: true, characterData: true };
            observer.observe(target, config);
        } else if (isMarketplace !== null) {
            await handleNftPage();
        } else if (isItemDetails !== null) {
            if (IS_AUTOBUY_ENABLED) {
                await autoBuy();
            }
        }

    })

    async function autoBuy() {
        let buyButton;
        while (true) {
            if (document.getElementsByClassName('me-3').length === 0) {
                await sleep(250);
                continue;
            } else {
                buyButton = document.getElementsByClassName('me-3')[0];
                break;
            }
        }
        var isConnectClicked = 0;
        while (true) {
            if (buyButton.innerText === "Connect Wallet") {
                if (isConnectClicked === 0) {
                    buyButton.click();
                    isConnectClicked += 1;
                }
                await sleep(250);
                continue;
            } else {
                buyButton.click();
                break;
            }
        }
    }
    async function handleNftPage() {
        addStatusToNavbar();
        let everyNFTVisibleOnPage;
        while (true) {
            everyNFTVisibleOnPage = document.getElementsByClassName('pb-0');
            if(everyNFTVisibleOnPage.length === 0) {
                await sleep(1000);
                continue;
            } else {
                break;
            };
        };
        try {
            const betterViewButton = document.getElementsByClassName("tw-opacity-80")[0];
            betterViewButton.click();
        } catch (err) {
            console.log("Could not use the better view button.");
        }
        let oldNFTs = [...document.getElementsByClassName('pb-0')];
        document.getElementsByClassName('me-refresh-btn')[0].addEventListener('click', async function () {

        })
        var firstTime = 0;
        while (true) {
            const NFTs = [...document.getElementsByClassName('pb-0')];
            if (oldNFTs.length == NFTs.length && firstTime !== 0) {
                await sleep(1000);
                continue;
            } else {
                if (firstTime === 0) {
                    await addButtons(NFTs);
                    firstTime += 1;
                    continue;
                } else {
                    let nftsToUpdate = [...NFTs];
                    await nftsToUpdate.splice(0, oldNFTs.length);
                    await addButtons(nftsToUpdate);
                    oldNFTs = NFTs;
                    continue;
                }
            }
        }
    }
    async function addButtons(NFTarray) {
        for (var i = 0; i < NFTarray.length; i++) {
            const href = NFTarray[i].children[0].href; // https://magiceden.io/item-details/ERKLWrgPWYfxCMMYB8PPifbtkdr6Eo9bToS2SHH7ow3E
            const box = NFTarray[i];
            box.parentElement.style = "display: flex; flex-direction: row; overflow: hidden;"
            box.style = "min-width: 0;"
            box.parentElement.innerHTML += `<div style="display: flex;align-items: center; text-align: center; background-color: gray; height:100px;"><a href="${href}" class="button" style="margin-top: 50%; color: white; display:block; width: 100%; height: 100%;">FAST BUY</a></div>`
        }
    };

    async function triggerAutobuy() {
        GM_setValue('MEFastbuy', JSON.stringify({enabled: !IS_AUTOBUY_ENABLED}));
        IS_AUTOBUY_ENABLED = !IS_AUTOBUY_ENABLED;
        if (IS_AUTOBUY_ENABLED) {
            document.getElementsByClassName('navbar')[0].children[0].children[3].children[1].innerText = 'FAST BUY: ENABLED';
            document.getElementsByClassName('navbar')[0].children[0].children[3].children[1].style = 'color: green;';
        } else {
            document.getElementsByClassName('navbar')[0].children[0].children[3].children[1].innerText = 'FAST BUY: DISABLED';
            document.getElementsByClassName('navbar')[0].children[0].children[3].children[1].style = 'color: red;';
        }
    }

    async function addStatusToNavbar() {
        await sleep(2000);
        const navbar = document.getElementsByClassName('navbar')[0].children[0].children[3];
        let text;
        let style;
        if (IS_AUTOBUY_ENABLED) {
            text = 'FAST BUY: ENABLED';
            style = 'color: green;'
        } else {
            text = 'FAST BUY: DISABLED';
            style = 'color: red;'
        }
        navbar.innerHTML += `<button style="${style}">${text}</button>`
        document.getElementsByClassName('navbar')[0].children[0].children[3].children[1].addEventListener("click", triggerAutobuy);
    }
})();