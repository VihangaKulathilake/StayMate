import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Provider } from 'react-redux'
import { store } from './store'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "858941370780-4dsstolanc8oa6o925pr3tgvaifm68c8.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <GoogleOAuthProvider
                clientId={GOOGLE_CLIENT_ID}
                locale="en"
            >
                <App />
            </GoogleOAuthProvider>
        </Provider>
    </React.StrictMode>,
)
