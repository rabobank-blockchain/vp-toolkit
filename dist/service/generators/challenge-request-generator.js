"use strict";
/*
 * Copyright 2020 Coöperatieve Rabobank U.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vp_toolkit_models_1 = require("vp-toolkit-models");
class ChallengeRequestGenerator {
    constructor(_signer) {
        this._signer = _signer;
    }
    /**
     * Generate a signed Challenge Request object.
     *
     * Because CryptUtil is being used by the ChallengeRequestSigner,
     * we need to provide an accountId and keyId so the
     * challengerequest is signed with the correct derivated key.
     * If you use only one key for every sign action,
     * use 0 for accountId and keyId.
     *
     * @param {IChallengeRequestParams} params without proof!
     * @param {number} accountId
     * @param {number} keyId
     * @return ChallengeRequest
     */
    generateChallengeRequest(params, accountId, keyId) {
        const verificationMethod = this._signer.cryptUtil.derivePublicKey(accountId, keyId);
        params.proof = {
            type: this._signer.signatureType,
            created: new Date(),
            verificationMethod: verificationMethod
        };
        const challengeRequest = new vp_toolkit_models_1.ChallengeRequest(params);
        challengeRequest.proof.signatureValue = this._signer.signChallengeRequest(challengeRequest, accountId, keyId);
        return challengeRequest;
    }
}
exports.ChallengeRequestGenerator = ChallengeRequestGenerator;
//# sourceMappingURL=challenge-request-generator.js.map