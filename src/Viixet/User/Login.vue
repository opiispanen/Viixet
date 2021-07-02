<template>
<div class="login-form">
    <div class="form-item">
        <label>
            <span class="form-item--label">
                Username
            </span>
            <input type="email" name="username" @keyup.enter="onEnter" v-model="username">
        </label>
    </div>
    <div class="form-item" v-if="!forgotPassword">
        <label>
            <span class="form-item--label">
                Password
            </span>
            <input type="password" name="password" @keyup.enter="onEnter" v-model="password">
        </label>
    </div>
    <div class="form-item" v-if="forgotPassword">
        <label>
            <span class="form-item--label">
                Email
            </span>
            <input type="email" name="email" @keyup.enter="onEnter" v-model="email">
        </label>
    </div>
    <button v-if="!forgotPassword"
        class="button button-wide button-primary"
        @click="login">
        Login	
    </button>
    <button v-if="forgotPassword"
        class="button button-wide button-primary"
        @click="resetPassword">
        Reset password	
    </button>
    <p style="text-align: center;cursor:pointer;" v-if="!forgotPassword && $store.getters['sendEmailEnabled']">
        <span role="button" @click="forgotPassword = true">I forgot my password</span>
    </p>
    <p style="text-align: center;cursor:pointer;" v-if="forgotPassword">
        <span role="button" @click="forgotPassword = false">Nevermind, I got this</span>
    </p>
    <button 
        v-if="false"
        class="button button-wide"
        @click="testConnection">
        Test connection	
    </button>
</div>
</template>

<script>
export default {
    name: 'ViixetLogin',
    props: {
        useCallbacks: {
            default: true,
            type: Boolean
        }
    },
	data: () => ({
        forgotPassword: false,
        email: '',
		username: '',
		password: '',
	}),
	methods: {
        onEnter() {
            if (this.forgotPassword) this.resetPassword()
            else this.login()
        },
        login() {
            this.$store
                .dispatch('user/login', {
                    username: this.username,
                    password: this.password
                })
                .then((response) => {
                    if (this.useCallbacks) {
                        const callbackState = this.$store.state.user.callbackState
                        const callbacks = this.$store.state.user.callbacks
                        
                        callbacks.forEach((callback) => callback())
                        this.$nextTick(() => this.$router.push(callbackState))
                    }
                    this.$store.dispatch('user/reset');
				})
				.catch((response) => {
                    this.viixetAlert({
                        message: this.$translate('USER_LOGIN_FAILURE'),
                        buttons: [
                            {
                                text: this.$translate('OK'),
                                type: 'default',
                                callback: 'confirm'
                            }
                        ]
                    })
				})
        },
        resetPassword() {
            if (this.username.trim().length === 0 || this.email.trim().length === 0) {
                this.viixetAlert({
                    message: this.$translate('INSUFFICIENT_DETAILS'),
                    buttons: [
                        {
                            text: this.$translate('OK'),
                            type: 'default',
                            callback: 'confirm'
                        }
                    ]
                })
                return;
            }

            const onSuccess = () => {
                this.viixetAlert({
                    message: this.$translate('USER_REQUESTPASSWORDRESET_SUCCESS'),
                    buttons: [
                        {
                            text: this.$translate('OK'),
                            type: 'default',
                            callback: 'confirm'
                        }
                    ]
                })
                $store.commit('toggleModal', false)
            }
            const onFailure = () => {
                this.viixetAlert({
                    message: this.$translate('USER_REQUESTPASSWORDRESET_FAILURE'),
                    buttons: [
                        {
                            text: this.$translate('OK'),
                            type: 'default',
                            callback: 'confirm'
                        }
                    ]
                })
            }

            this.$store.dispatch('user/resetPassword', {
                username: this.username,
                email: this.email,
                lang: this.$store.getters['activeLang']
            })
            .then(({ data }) => {
                if (data.success) onSuccess()
                else onFailure()
            })
            .catch(() => onFailure())
        }
	},
    mounted() {
    }
}
</script>

