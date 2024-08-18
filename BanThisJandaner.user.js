// ==UserScript==
// @name         勞資不想看到你個sb
// @namespace    http://tampermonkey.net/
// @version      1.32
// @description  通過網頁操作, 達成屏蔽與解除屏蔽使用者
// @author       You
// @match        *://jandan.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jandan.net
// @grant        none
// @downloadURL https://update.greasyfork.org/scripts/483130/%E5%8B%9E%E8%B3%87%E4%B8%8D%E6%83%B3%E7%9C%8B%E5%88%B0%E4%BD%A0%E5%80%8Bsb.user.js
// @updateURL https://update.greasyfork.org/scripts/483130/%E5%8B%9E%E8%B3%87%E4%B8%8D%E6%83%B3%E7%9C%8B%E5%88%B0%E4%BD%A0%E5%80%8Bsb.meta.js
// ==/UserScript==


(function () {
    // 檢查 localStorage 中是否存在 banCode 鍵值對 , 若不存在則新增一個空物件
    const BAN_CODE_KEY = 'banCode';

    function initializeBanCode() {
        try {
            const banCode = localStorage.getItem(BAN_CODE_KEY);
            if (!banCode) {
                localStorage.setItem(BAN_CODE_KEY, '{}');
            } else {
                console.log('Here is who you ban: ' + banCode);
            }
        } catch (error) {
            console.error('Error accessing localStorage:', error);
        }
    }

    initializeBanCode();

    // 將 localStorage 中的 banCode 鍵值對解析為 JSON 物件
    var banCode = JSON.parse(localStorage.getItem(BAN_CODE_KEY))

    // 獲取網頁中的所有評論列表
    var comment = document.getElementsByClassName("commentlist")
    var lis = comment[0].getElementsByTagName("li")

    // 獲取網頁中的所有 .text 元素
    var row = document.querySelectorAll('.text')

    // 定義屏蔽按鈕
    var voteElements = document.querySelectorAll(".jandan-vote")

    // 定義吐槽按鈕
    var tucao = document.querySelectorAll(".tucao-btn")


    //定義 unban 函式
    function unban(e) {
        // 獲取 li 元素
        var li = e.parentNode.parentNode.parentNode;

        // 獲取作者姓名
        var author = li.getElementsByClassName("author")[0].getElementsByTagName("strong")[0].textContent;

        // 確認是否解除屏蔽
        if (confirm("讓我看看 " + author + " 這傢夥有什麼長進")) {
            // 從 banCode 物件中刪除 author 對應的鍵值對
            delete banCode[author];

            // 將更新後的 banCode 物件存入 localStorage
            localStorage.setItem(BAN_CODE_KEY, JSON.stringify(banCode));

            // 重新載入頁面
            location.reload();
        }
    }

    // 定義 ban 函式
    function ban(e) {
        // 獲取 li 元素
        var li = e.parentNode.parentNode.parentNode;

        // 獲取作者姓名
        var author = li.getElementsByClassName("author")[0].children[0];

        // 獲取作者防偽碼
        var privCode = author.getAttribute('title').split('防伪码：').pop();

        // 確認是否屏蔽
        if (confirm("您確定要屏蔽 " + author.textContent + " 嗎？")) {
            // 將作者姓名和防偽碼新增至 banCode 物件中
            banCode[author.textContent] = privCode;

            // 將更新後的 banCode 物件存入 localStorage
            localStorage.setItem(BAN_CODE_KEY, JSON.stringify(banCode));

            // 重新載入頁面
            location.reload();
        }
    }

    // 定義 unBanUser 函式
    function unBanUser(e) {
        // 確認是否解除屏蔽
        if (confirm("讓我看看 " + e + " 這傢夥有什麼長進")) {
            // 從 banCode 物件中刪除 author 對應的鍵值對
            delete banCode[e];

            // 將更新後的 banCode 物件存入 localStorage
            localStorage.setItem(BAN_CODE_KEY, JSON.stringify(banCode));

            // 重新載入頁面
            location.reload();
        }
    }

    function tucaoHandle(e) {
        var tucaoRows = e.querySelectorAll('.tucao-list .tucao-row');
        var tucaoHotRows = e.querySelectorAll('.tucao-hot .tucao-row');
        var banCode = JSON.parse(localStorage.getItem("banCode"));

        // 取得所有鍵名並放入一個陣列
        const keys = Object.keys(banCode);

        // 遍歷鍵名陣列，同時取得索引
        for (let i = 0; i < keys.length; i++) {
            const item = keys[i];
            for(let ri = 0; ri < tucaoRows.length; ri++) {
                const tucaoAuthor = tucaoRows[ri].querySelector('.tucao-author');
                const textContent = tucaoAuthor.textContent;
                textContent.includes(item) ? tucaoRows[ri].remove() : '';
            }
            for(let hri = 0; hri < tucaoHotRows.length; hri++) {
                const tucaoAuthor = tucaoHotRows[hri].querySelector('.tucao-author');
                const textContent = tucaoAuthor.textContent;
                if (textContent.includes(item)) {
                    tucaoHotRows[tucaoHotRows.length === 1 ? 0 : hri].parentNode.remove();
                }
            }

        }
    }

    // 屏蔽防偽碼標記用戶
    for (let i = lis.length - 1; i >= 0; i--) {
        // 獲取作者姓名
        const author = lis[i].querySelector(".author strong");
        const authorName = author ? author.innerText : '';


        // 遍歷 banCode 物件中的所有鍵值對
        for (const [bannedAuthor, _] of Object.entries(banCode)) {
            // 若作者姓名與 banCode 物件中的鍵值對匹配
            if (authorName === bannedAuthor) {
                // 獲取評論內容
                const contentBox = lis[i].querySelector(".text");
                const img = lis[i].querySelector("img");
                const content = contentBox.querySelector('p:not(.bad_content)').textContent.replace(/<br>/g, ' ');

                // 將評論內容替換為 "[已屏蔽]" 標記
                contentBox.innerHTML = `<del class="delete"><span class="math-inline">${authorName} - 已屏蔽</span></del><i class="peep" title="${content}">偷看一下(懸停) ${img != null ? `<img style="opacity: 0;" src="${img.src}" alt="pic" />`: ''}</i>`;

                break;
            }
        }
    }

    // 遍歷所有 .jandan-vote 元素
    for (var x = 0; x < voteElements.length; x++) {
        // 創建一個新的 a 元素
        var button = document.createElement("a");

        // 若評論內容包含 "[已屏蔽]" 標記
        if (row[x].innerHTML.includes('del')) {
            // 設定按鈕文字為 "[解除屏蔽]"
            button.textContent = "[解除屏蔽]";

            // 為按鈕添加點擊解除屏蔽函式
            button.addEventListener("click", function () {
                unban(this);
            });
        } else {
            // 設定按鈕文字為 "[屏蔽]"
            button.textContent = "[屏蔽]";

            // 為按鈕添加點擊屏蔽函式
            button.addEventListener("click", function () {
                ban(this);
            });
        }

        // 設定按鈕顏色為 "#c8c7cc"
        button.style.color = "#c8c7cc";

        // 將按鈕插入到 .jandan-vote 元素的開頭
        voteElements[x].prepend(button);
    }

    // 生成list按鈕Dom
    var counter = Object.keys(banCode).length
    var listDom = `
        <div class="banList">
            <a class="toggleList">屏蔽列表 <span class="toggleList-show">+</span><span class="toggleList-hide">-</span></a>
            <ul class="mainList">
    `

    // 循环遍历 banCode 对象中的已屏蔽用户
    for (var li = 0; li < counter; li++) {
        listDom += `
                <li class="mainList-item">${Object.keys(banCode)[li]} <a class="unban" href="javascript: void();">x</a></li>
        `
    }

    listDom += `
            </ul>
            <form id="banForm">
                <input class="ban-input" type="text" placeholder="手動屏蔽" />
            </form>
        </div>
    `

    // 获取 DOM 元素
    const wrapper = document.getElementById('wrapper');
    const listDomElement = document.createElement('div');
    listDomElement.innerHTML = listDom;
    wrapper.appendChild(listDomElement);

    // 添加点击事件监听器，用于处理删除按钮的点击
    wrapper.addEventListener('click', (event) => {
        if (event.target.classList.contains('unban') && !event.target.classList.contains('clicked')) {
            const username = event.target.parentNode.textContent.trim().replace(' x', '');
            unBanUser(username);
            event.target.classList.add('clicked')
        }
        if (event.target.classList.contains('tucao-btn') && !event.target.classList.contains('clicked')) {
            var tucaoId = event.target.dataset.id;
            var tucaoBox = document.getElementById(`jandan-tucao-${tucaoId}`)
            var intervalBox = setInterval(() => {
                if (tucaoBox.innerText !== "数据加载中....biubiubiu....") {
                    tucaoHandle(tucaoBox);
                    clearInterval(intervalBox);
                    event.target.classList.add('clicked')
                }
            }, 100);
        }
    });

    // 获取并缓存屏蔽用户列表 DOM 元素
    const toggleList = document.querySelector('.toggleList');
    if(toggleList != null) {
        // 添加点击事件监听器，用于展开/收起屏蔽用户列表
        toggleList.addEventListener('click', function() {
            const secondSpan = this.querySelector('span:nth-of-type(2)');
            const ul = document.querySelector('.mainList');

            secondSpan.style.display = secondSpan.style.display === 'none' ? 'block' : 'none';
            ul.style.display = ul.style.display === 'none' ? 'block' : 'none';
        });
    }

    // 手動屏蔽功能
    const myForm = document.getElementById('banForm');
    const myInput = document.querySelector('.ban-input');

    myForm.addEventListener('submit', function(event) {
        event.defaultPrevented();

        const inputValue = myInput.value;

        if (confirm("此屏蔽無法正確辨識身分, 換個暱稱就屏蔽不了了, 您確定要屏蔽 " + inputValue + " 嗎？")) {
            let banData = JSON.parse(localStorage.getItem("banCode")) || {}; // 初始化為空物件

            if (!banData[inputValue]) { // 避免重複添加
                banData[inputValue] = "";
                localStorage.setItem("banCode", JSON.stringify(banData));
                location.reload();
            } else {
                alert("該用戶已經被屏蔽");
            }
        }
    });

    setTimeout(() => {
        // 创建 style 元素
        var style = document.createElement('style');
         // 创建文本节点，包含 CSS 规则
        style.innerHTML = `
            .commentlist .row {
                overflow: visible;
            }

            .delete {
                display: inline-block;
                margin-bottom: 20px;
                margin-top: 7px;
                margin-right: 5px;
            }

            .peep {
                display: inline-block;
                position: relative;
                font-size: 10px;
            }

            .peep img {
                position: absolute;
                left: calc(100% + 10px);
                opacity: 0;
                max-width: 250px !important;
                pointer-events: none;
            }

            .peep:hover img{
                opacity: 1 !important;
                transition: .5s ease;
            }

            .banList {
                display: flex;
                flex-wrap: wrap;
                justify-content: flex-end;
                position: fixed;
                top: 84px;
                width: 1184px;
                pointer-events: none;
                width: calc((100vw - 984px - 60px) / 2);
                max-height: calc(100% - 300px);
                box-sizing: border-box;
                left: calc(100% - (100vw - 984px - 30px) / 2);
            }

            .toggleList {
                padding: 5px;
                position: relative;
                text-align: center;
                width: 100%;
                border-radius: 5px;
                background: #bababa;
                color: white;
                font-weight: bold;
                pointer-events: auto;
            }

            .toggleList-show {
                display: inline-block;
                position: absolute;
                width: 20px;
                height: 20px;
                right: 5px;
            }

            .toggleList-hide {
                position: absolute;
                width: 20px;
                height: 20px;
                top: 5px;
                right: 5px;
                background: #bababa;
                display: none;
            }

            .mainList {
                margin-bottom: 3px;
                position: relative;
                width: 90px;
                top: calc(100% + 10px);
                display: none;
                width: 100%;
                color: gray;
                overflow: auto;
                height: calc(100vh - 196px);
            }

            .mainList-item {
                margin-bottom: 4px;
                padding-bottom: 4px;
                width: 100%;
                border-bottom: 1px solid gray;
                font-size: 12px;
                white-space:nowrap;
                text-overflow:ellipsis;
                -o-text-overflow:ellipsis;
                overflow: hidden;
                max-width: 100%;
                padding-right: 20px;
                box-sizing: border-box;
            }

            .unban {
                pointer-events: auto;
                cursor: pointer;
                position: absolute;
                right: 0;
            }

            #banForm {
                position: absolute;
                bottom: calc(100% + 5px);
                left: 0;
                width: 100%;
                pointer-events: auto;
            }
            #banForm .ban-input {
                position: relative;
                width: 100%;
                border-color: #d8d8d8;
                border-width: 0px 00px 1px 0px;
            }
            #banForm .ban-input:focus {
                outline: none;
            }
            #banForm .ban-input::placeholder {
                color: #d8d8d8;
            }
        `;
        document.head.appendChild(style);
    }, 1);
})();