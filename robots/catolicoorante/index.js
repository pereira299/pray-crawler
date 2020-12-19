const { chromium } = require('playwright');
const _ = require('lodash');

async function getFromUrl(url){
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url);

    const result = await page.evaluate(() => {
        const pray = {
            title:"",
            content:""
        }
        const title = document.querySelector('.ui-content h3')
        pray.title = title ? title.innerText : ""
        const content = document.querySelector('.ui-content div p')
        pray.content = content ? content.innerText  : ""
        return pray;
      })

    browser.close()
    return result;
}


function split(data){
    let content = data.content.split('\n');
    content = content.filter( elem => {
        if(elem.length > 0) 
            return elem
    })
    let part = "";
    const parts = []
    for(let i = 0; i < content.length; i++){
        const elem = content[i];
        if(part.length > 220){
            parts.push(part);
            part = "";
        }
        part = part + '\n' + elem;
    }
    parts.push(part);
    data.content = parts;
    return data;
}


function addRefs(data, refs){
    let content = data.content.split('\n').map( elem => {
        if(elem.length < 30 && elem.length > 0){
            const str = elem.replace(/[^a-zA-Z ]/g, "");
            const res = refs.filter( item => {
                if(_.includes(str,item.title)){
                    return item.content
                }
            });
            if(res.length > 0){
                return res[0].content;
            }
        }
        return elem;
    })
    content = content.join('\n');
    if(content.length > 0){
        data.content = content;
    }
    return data

}

async function sendToDB(){

}


async function main(){
    const baseUrl = "http://www.catolicoorante.com.br/oracao.php?id=";
    const ids = [1,2,3,4,5,6,7,8,9,10];
    const prayers = [];
    for (const id of ids) {
        let pray = await getFromUrl(baseUrl+id);
        if(pray.content.length == 0){
            continue;
        }
        pray.id = id;
        pray = addRefs(pray, prayers)
        pray = split(pray);
        prayers.push(pray);
    }
    return prayers;
}

module.exports.main = main;