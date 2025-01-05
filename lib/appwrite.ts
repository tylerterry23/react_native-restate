import {Client, Account, OAuthProvider, Avatars} from "react-native-appwrite";
import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";
  

export const config = {
    platform: 'com.jsm.restate',
    endpoint: process.env.REACT_APP_ENDPOINT,
    projectId: process.env.REACT_APP_PROJECT_ID,
}

export const client = new Client()

client
    .setEndpoint(config.endpoint!)
    .setProject(config.projectId!)
    .setPlatform(config.platform!)

export const avatar = new Avatars(client)
export const account = new Account(client)

export async function login() {
    try {
      const redirectUri = Linking.createURL("/");
  
      const response = await account.createOAuth2Token(
        OAuthProvider.Google,
        redirectUri
      );
      if (!response) throw new Error("Create OAuth2 token failed");
  
      const browserResult = await openAuthSessionAsync(
        response.toString(),
        redirectUri
      );
      if (browserResult.type !== "success")
        throw new Error("Create OAuth2 token failed");
  
      const url = new URL(browserResult.url);
      const secret = url.searchParams.get("secret")?.toString();
      const userId = url.searchParams.get("userId")?.toString();
      if (!secret || !userId) throw new Error("Create OAuth2 token failed");
  
      const session = await account.createSession(userId, secret);
      if (!session) throw new Error("Failed to create session");
  
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
}


export async function logout() {
    try {
      await account.deleteSession("current");
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
}


export async function getUser() {
    try {
      const response = await account.get();
      if (response.$id) {
        const userAvatar = avatar.getInitials(response.name);
        return { ...response, avatar: userAvatar.toString() };
      }
  
    } catch (error) {
      console.error(error);
      return null;
    }
}