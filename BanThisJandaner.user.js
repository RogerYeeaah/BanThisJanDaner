// ==UserScript==
// @name         勞資不想看到你個sb
// @namespace    http://tampermonkey.net/
// @version      1.13
// @description  通過網頁操作, 達成屏蔽與解除屏蔽使用者
// @author       You
// @match        *://jandan.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jandan.net
// @grant        none
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==


(function () {
    // 檢查 localStorage 中是否存在 banCode 鍵值對 , 若不存在則新增一個空物件
    localStorage.getItem('banCode') == undefined ? localStorage.setItem('banCode', '{}') : console.log('Here is who you ban: ' + localStorage.getItem('banCode'))

    // 將 localStorage 中的 banCode 鍵值對解析為 JSON 物件
    var banCode = JSON.parse(localStorage.getItem('banCode'))

    // 計算 banCode 物件中的鍵值對數量
    var banCodeKeys = Object.keys(banCode).length

    // 獲取網頁中的所有評論列表
    var comment = document.getElementsByClassName("commentlist")
    var lis = comment[0].getElementsByTagName("li")

    // 獲取網頁中的所有 .text 元素
    var row = document.querySelectorAll('.text')

    // 定義屏蔽按鈕
    var voteElements = document.querySelectorAll(".jandan-vote")

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
            localStorage.setItem('banCode', JSON.stringify(banCode));

            // 重新載入頁面
            location.reload();
        }
    }

    // 定義 ban 函式
    function ban(e) {
        // 獲取 li 元素
        var li = e.parentNode.parentNode.parentNode;

        // 獲取作者姓名
        var author = li.getElementsByClassName("author")[0].getElementsByTagName("strong")[0];

        // 獲取作者防偽碼
        var privCode = $(author).attr('title').split('防伪码：').pop();

        // 確認是否屏蔽
        if (confirm("您確定要屏蔽 " + author.textContent + " 嗎？")) {
            // 將作者姓名和防偽碼新增至 banCode 物件中
            banCode[author.textContent] = privCode;

            // 將更新後的 banCode 物件存入 localStorage
            localStorage.setItem('banCode', JSON.stringify(banCode));

            // 重新載入頁面
            location.reload();
        }
    }

    // 定義 unBanUser 函式
    $(document).ready(function() {
        window.unBenUser = function(e) {
        // 確認是否解除屏蔽
        if (confirm("讓我看看 " + e + " 這傢夥有什麼長進")) {
            // 從 banCode 物件中刪除 author 對應的鍵值對
            delete banCode[e];

            // 將更新後的 banCode 物件存入 localStorage
            localStorage.setItem('banCode', JSON.stringify(banCode));

            // 重新載入頁面
            location.reload();
        }
        };
    });

    // 屏蔽防偽碼標記用戶
    for (var i = lis.length - 1; i >= 0; --i) {
        // 獲取作者姓名
        var author = lis[i].getElementsByClassName("author")[0].getElementsByTagName("strong")[0];

        // 遍歷 banCode 物件中的所有鍵值對
        for (var j = 0; j < banCodeKeys; ++j) {
            // 若作者姓名與 banCode 物件中的鍵值對匹配
            if (author.textContent === Object.entries(banCode)[j][0]) {
                // 獲取評論內容
                var contentBox = lis[i].getElementsByClassName("text")
                var content = $(contentBox).find('p:not(.bad_content)')[0].innerHTML.split('<br>').join()

                // 將評論內容替換為 "[已屏蔽]" 標記
                lis[i].getElementsByClassName("text")[0].innerHTML = `<del style="display: inline-block; margin-bottom: 20px; margin-top: 7px; margin-right: 5px;"><span class="math-inline">${author.textContent} - 已屏蔽</span></del><i title="${content}" style="display: inline-block; font-size: 10px; ">偷看一下(懸停)</i>`;

                // 跳出內層迴圈
                break
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
            <div class="ban-list" style="display: flex; justify-content: flex-end; position: fixed; top: 84px; right: 50%; width: 1184px; max-height: calc(100% - 300px); transform: translateX(-50%); pointer-events: none">
                <a class="toggleList" style="padding: 5px; position: relative; text-align: center; border-radius: 5px; background: #bababa; color: white; font-weight: bold; pointer-events: auto;">屏蔽列表 <span style="display: inline-block; width: 20px; height: 20px">+</span><span style="position: absolute; width: 20px; height: 20px; top: 5px; right: 5px; background: #bababa; display: none;">-</span></a>
                <ul style="margin-bottom: 3px; position: absolute; width: 90px; top: calc(100% + 10px); display: none; color: gray; overflow: hidden;">
    `

    for (var li = 0; li < counter; li++) {
        listDom += `
            <li style="margin-bottom: 4px; padding-bottom: 4px; width: 100%; border-bottom: 1px solid gray; font-size: 12px; white-space:nowrap; text-overflow:ellipsis; -o-text-overflow:ellipsis; overflow: hidden;">${Object.keys(banCode)[li]} <a class="delete" style="pointer-events: auto" onclick="unBenUser('${Object.keys(banCode)[li]}')">x</a></li>
        `
    }

    listDom += `
                </ul>
            </div>
    `

    $('#wrapper').append(listDom)

    const toggleList = document.querySelector('.ban-list')
    toggleList.addEventListener('click', function() {
        $($(this).find('span:nth-of-type(2)')).toggle()
        $($(this).find('ul')).toggle()
    })
})();