// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use reqwest;
use url::form_urlencoded;
use regex::Regex;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn get_account(guid: &str, password: &str) -> String {
    let url = "https://www.realmofthemadgod.com/account/verify";
    let body: String = form_urlencoded::Serializer::new(String::new())
        .append_pair("clientToken", "0")
        .append_pair("guid", guid)
        .append_pair("password", password)
        .finish();
    
    let client = reqwest::blocking::Client::new();
    let response = client.post(url)
    .header(reqwest::header::CONTENT_TYPE, "application/x-www-form-urlencoded")
    .body(body)
    .send();


    let body = response.unwrap().text();
 
    let re = Regex::new(r#"<AccessToken>(.*?)</AccessToken>"#).unwrap();
    let mut access_token = None;
    let mut res = None;
    // Extract the token using the regex pattern
    if let Some(caps) = re.captures(&format!("{:?}",body)) {
        if let Some(token) = caps.get(1) {
            access_token = Some(token.as_str().to_string());
        }
    }
    //println!("body = {body:?}");
    if let Some(token) = &access_token {
        println!("{}", token);
        let url = format!("https://www.realmofthemadgod.com/char/list?muleDump=true&{}",form_urlencoded::Serializer::new(String::new()).append_pair("accessToken",token).finish());
        let response = reqwest::blocking::get(url);

        let body = response.unwrap().text();
        res = Some(body);
        //format!("{:?}",body)
    }
    return res.unwrap().unwrap();
    //println!("{:?}",res)
    //format!("Body:\n{}", body)
    //format!("Hello, {}! You've been greeted from Rust!", "ASD")

}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_account])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
