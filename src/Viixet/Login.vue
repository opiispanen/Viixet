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
import { EventBus } from './EventBus.js'

export default {
	name: 'ViixetLogin',
	data: () => ({
		username: '',
		password: '',
		errors: []
	}),
	methods: {
		login: function() {
			this.$userService
				.login(this.username, this.password)
				.then((response) => {
					const 
						callbackState = this.$userService.callbackState,
						callbacks = this.$userService.callbacks

					callbacks.forEach((callback) => callback())

					this.$router.push(callbackState)

                    this.$userService.reset();
                    
                    EventBus.$emit('Viixet.onLogin', true);
				})
				.catch((response) => {
                    this.errors.push('Login failed');

                    EventBus.$emit('Viixet.onLogin', false);
				})
		}
	}
}
</script>

