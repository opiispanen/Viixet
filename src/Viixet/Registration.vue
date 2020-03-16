<template>
<div class="login-form">
    <div class="form-item">
        <label>
            <span class="form-item--label">
                Email
            </span>
            <input type="email" name="email" v-model="email">
        </label>
        <span class="badge badge-danger" v-if="email.length > 3 && emailLegit">
            Not a proper email
        </span>
    </div>
    <div class="form-item">
        <label>
            <span class="form-item--label">
                Username
            </span>
            <input type="text" name="username" v-model="username">
        </label>
        <span class="badge badge-danger" v-if="username.length > 3 && usernameLegit">
            Username must be longer than 3 characters
        </span>
    </div>
    <div class="form-item">
        <label>
            <span class="form-item--label">
                Password
            </span>
            <input type="password" name="password" v-model="password">
        </label>
    </div>
    <div class="form-item">
        <label>
            <span class="form-item--label">
                Repeat password
            </span>
            <input type="password" name="password-repeat" v-model="passwordRepeat">
        </label>
        <span class="badge badge-danger" v-if="password.length && passwordRepeat.length && !passwordLegit">
            Passwords don't match
        </span>
    </div>
    <div class="form-item">
        <label>
            <input type="checkbox" name="consent" v-model="consent">
            I understand and accept the terms of use (above)
        </label>
    </div>
    <div class="row">
        <div class="col-xs-12">
            <button 
                class="button button-wide button-primary"
                :disabled="!allLegit"
                @click="registration">
                Create account	
            </button>
        </div>
        <div class="col-xs-6" v-if="false">
            <router-link 
                class="button button-wide"
                :to="{ name: 'SignIn' }">
                Cancel
            </router-link>
            <button 
                class="button button-wide"
                v-if="false"
                @click="$emit('ViixetRegistration.cancel')">
                Cancel	
            </button>
        </div>
    </div>
</div>
</template>

<script>
export default {
	name: 'ViixetRegistration',
    props: {
        useCallbacks: {
            default: true,
            type: Boolean
        }
    },
	data: () => ({
        validForm: false,
		username: '',
		password: '',
        passwordRepeat: '',
        email: '',
        consent: false
	}),
    computed: {
        emailLegit() {
            const regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;

            return regex.test(this.username) 
        },
        usernameLegit() {
            this.username.length > 3
        },
        passwordLegit() {
            return this.password === this.passwordRepeat;
        },
        allLegit() {
            return this.passwordLegit 
                && this.usernameLegit
                && this.emailLegit
                && this.consent;
        }
    },
	methods: {
        registration() {
            if (!this.allLegit) {
                return false;
            }

            this.$store
                .dispatch('user/registration', {
                    email: this.email,
                    username: this.username,
                    password: this.password
                })
			    .then((response) => {
					const data = response.data;

					if (data.success) {
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
				})
				.catch((response) => {
                    console.log('fail', response);
				})
		}
	}
}
</script>