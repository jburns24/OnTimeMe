import { NativeStorage } from '@ionic-native/native-storage';

export class NativeStorageMock extends NativeStorage {
    /**
     * Stores a value
     * @param reference {string}
     * @param value
     * @returns {Promise<any>}
     */
    setItem(reference: string, value: any): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve();
        });
    };
    /**
     * Gets a stored item
     * @param reference {string}
     * @returns {Promise<any>}
     */
    getItem(reference: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (reference == 'user')
            {
                let user = {
                    "authToken" : "ya29.Gly2BfpvD1XWXjHY22kN6luQNEzZaaVDEdugPi1KyKdqt9KwrfBczSpHZjy8iXjZvspjqLXWJTPAr7HqQxQgsfjYbruLD3M_69z6gAePgJHRa2dxsuPQHNTJcn05iA",
                    "email" : "testuser@gmail.com",
                    "id" : "111696224874024244260",
                    "isLoggedIn" : true,
                    "name" : "test user",
                    "picture" : "data:image/png;base64,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",
                    "serverAuthCode" : "4/AAC5xvNfMpPQv779JZh2ViKKSGMuHQVM8uKabab-PG1lqw5AZSoXsYcCmpTipR7hVvpG9rj3Fl8uqcbISL-RuAk"
                };
                resolve(user);
            }
            // else
            //     resolve();
        });
    };
    /**
     * Retrieving all keys
     * @returns {Promise<any>}
     */
    keys(): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve();
        });
    };
    /**
     * Removes a single stored item
     * @param reference {string}
     * @returns {Promise<any>}
     */
    remove(reference: string): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve();
        });
    };
    /**
     * Removes all stored values.
     * @returns {Promise<any>}
     */
    clear(): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve();
        });
    };
}
