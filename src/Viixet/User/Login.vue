<template>
<div class="login-form">
    <div class="form-item">
        <label>
            <span class="form-item--label">
                Username
            </span>
            <input type="text" name="username" @keyup.enter="login" v-model="username">
        </label>
    </div>
    <div class="form-item">
        <label>
            <span class="form-item--label">
                Password
            </span>
            <input type="password" name="password" @keyup.enter="login" v-model="password">
        </label>
    </div>
    <button 
        class="button button-wide button-primary"
        @click="login">
        Login	
    </button>
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
		username: '',
		password: '',
		errors: []
	}),
	methods: {
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
                    this.errors.push('Login failed');
				})
        }
	}
}
</script>

