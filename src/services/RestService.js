import axios from 'axios'
import { EventBus } from '../Viixet/EventBus.js'

const requestMiddleware = (response) => {
    const data = response.data;

    if (data.loginRequired === true) {
        EventBus.$emit('Viixet.loginRequired');
    }

    if (!!data.error && data.error === 'Ownership error') {
        EventBus.$emit('Viixet.ownershipError');
    }

    return response;
}

class RestService {
    constructor(endpoint) {
        this._endpoint = endpoint;
    }

    get(id = false, urlAddition = false) {
        let url = !!id ? `/${ this._endpoint }/${ id }` : `/${ this._endpoint }`;

        if (!!urlAddition)
            url += urlAddition;

        return axios.get(url).then(requestMiddleware)
    }

    post(data = {}, urlAddition = false) {
        let url = `/${ this._endpoint }`;

        if (!!urlAddition)
            url += urlAddition;

        return axios.post(url, data).then(requestMiddleware)
    }

    update(id, data = {}, urlAddition = false) {
        let url = `/${ this._endpoint }/${ id }`;

        if (!!urlAddition)
            url += urlAddition;

        return axios.put(url, data).then(requestMiddleware)
    }

    delete(id, urlAddition = false) {
        let url = `/${ this._endpoint }/${ id }`;

        if (!!urlAddition)
            url += urlAddition;

        return axios.delete(url).then(requestMiddleware)
    }
}

export default RestService