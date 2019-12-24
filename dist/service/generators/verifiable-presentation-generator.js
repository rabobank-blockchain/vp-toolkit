"use strict";
/*
 * Copyright 2019 Rabobank NL
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
class VerifiablePresentationGenerator {
    constructor(_signer) {
        this._signer = _signer;
    }
    /**
     * Generate a signed Verifiable Presentation (VP) object.
     *
     * Because CryptUtil is being used by the VerifiablePresentationSigner,
     * we need to provide accountIds and keyIds so the
     * VP is provided with the correct ownership proofs.
     * If you use only one global key for your product,
     * then provide the accountId and keyId once.
     *
     * The VP proof array will be overwritten with a Proof set.
     * Proof chains are not supported.
     * @see https://w3c-dvcg.github.io/ld-proofs/#proof-sets
     *
     * @param {IVerifiablePresentationParams} params the proof will be overwritten!
     * @param {{accountId: number, keyId: number}[]} keys used to prove ownership over each VC inside
     * @param {string|undefined} correspondenceId optional value to use as proof.nonce field
     * @return VerifiablePresentation
     */
    generateVerifiablePresentation(params, keys, correspondenceId) {
        params.proof = this._signer.generateProofs(params, keys, correspondenceId);
        return new vp_toolkit_models_1.VerifiablePresentation(params);
    }
}
exports.VerifiablePresentationGenerator = VerifiablePresentationGenerator;
//# sourceMappingURL=verifiable-presentation-generator.js.map
