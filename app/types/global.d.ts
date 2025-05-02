// Google APIのグローバル型定義
interface Window {
    gapi: {
        load: (api: string, callback: () => void) => void
        client: {
            init: (config: any) => Promise<void>
            calendar: {
                events: {
                    insert: (params: any) => Promise<any>
                    list: (params: any) => Promise<any>
                }
            }
        }
    }
    google: {
        accounts: {
            oauth2: {
                initTokenClient: (config: any) => {
                    requestAccessToken: (options?: { prompt?: string }) => void
                }
            }
        }
    }
}
