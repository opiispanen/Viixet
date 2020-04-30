<template>
<div>
    <div v-if="enabled">
        <p>{{ usedSpace }}/{{ quota }} MB</p>
        <label>File
            <input type="file" id="files" ref="files" multiple :accept="accept.join(',')" />
        </label>
        <button v-on:click="submitFiles()">{{ $translate($store.state.lang, 'SUBMIT') }}</button>
    </div>
    <div v-else>
        <p v-if="requested"><span class="badge badge-big">{{ $translate($store.state.lang, 'FILE_PENDING_PRIVILEGES') }}</span></p>
        <p v-else>
            <button class="button button-thick" @click="$store.dispatch('files/requestPrivileges')">{{ $translate($store.state.lang, 'FILE_REQUEST_PRIVILEGES') }}</button>
        </p>
    </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    computed: {
        ...mapGetters({
            usedSpace: 'files/usedSpace',
            quota: 'files/quota',
            accept: 'files/mimetypes',
            requested: 'files/requested',
            enabled: 'files/enabled'
        })
    },
    methods: {
        submitFiles(){
            const files = this.$refs.files.files;
            
            this.$store.dispatch('files/upload', files)
                .then((data) => this.$emit('onLoad', data))
                .catch((error) => {
                    this.viixetAlert({
                        message: this.$translate(this.$store.state.lang, 'FILES_UPLOAD_FAILED'),
                        subMessage: this.$translate(this.$store.state.lang, error.response.data.error),
                        buttons: [
                            {
                                text: this.$translate(this.$store.state.lang, 'CONFIRM'),
                                type: 'bare',
                                callback: 'cancel'
                            }
                        ]
                    })
                })
        }
    }
}
</script>