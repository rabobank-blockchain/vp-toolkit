"use strict";
/*
 * Copyright 2019 Coöperatieve Rabobank U.A.
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
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vp_toolkit_models_1 = require("vp-toolkit-models");
class VerifiableCredentialGenerator {
    constructor(_signer) {
        this._signer = _signer;
    }
    /**
     * Generate a signed Verifiable Credential (VC) object.
     *
     * Because CryptUtil is being used by the VerifiableCredentialSigner,
     * we need to provide an accountId and keyId so the
     * VC is signed with the correct derivated key.
     * If you use only one key for every sign action,
     * use 0 for accountId and keyId.
     *
     * @param {IVerifiableCredentialParams} params without proof!
     * @param {number} accountId
     * @param {number} keyId
     * @return ChallengeRequest
     */
    generateVerifiableCredential(params, accountId, keyId) {
        const verificationMethod = this._signer.cryptUtil.derivePublicKey(accountId, keyId);
        params.proof = {
            type: this._signer.signatureType,
            created: new Date(),
            verificationMethod: verificationMethod
        };
        const vc = new vp_toolkit_models_1.VerifiableCredential(params);
        vc.proof.signatureValue = this._signer.signVerifiableCredential(vc, accountId, keyId);
        return vc;
    }
}
exports.VerifiableCredentialGenerator = VerifiableCredentialGenerator;
//# sourceMappingURL=verifiable-credential-generator.js.map