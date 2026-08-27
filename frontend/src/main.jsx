import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Provider } from 'react-redux'
import { store } from './store'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <GoogleOAuthProvider
                clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                locale="en"
            >
                <App />
            </GoogleOAuthProvider>
        </Provider>
    </React.StrictMode>,
)
