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

import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import { CredentialStatus, IProofParams, IVerifiablePresentationParams, VerifiableCredential } from 'vp-toolkit-models'
import { LocalCryptUtils } from 'crypt-util'
import { VerifiableCredentialSigner, VerifiablePresentationGenerator, VerifiablePresentationSigner } from '../../src'

const assert = chai.assert

const correspondenceId = 'a710042c-bff8-4fb4-af3e-bed9ead63698'
const testProof: IProofParams = {
  type: 'Secp256k1Signature2019',
  created: new Date(Date.UTC(2019, 0, 1, 23, 34, 56)),
  verificationMethod: 'pubkey'
}

const testCred = new VerifiableCredential({
  id: 'did:protocol:address',
  type: ['VerifiablePresentation'],
  issuer: 'did:protocol:issueraddress',
  issuanceDate: new Date(Date.UTC(2019, 0, 1, 23, 34, 56)),
  credentialSubject: {
    id: 'did:protocol:holderaddress',
    type: 'John'
  },
  proof: testProof,
  credentialStatus: new CredentialStatus({
    id: '0x6AbAAFB672f60C16C604A29426aDA1Af9d96d440',
    type: 'vcStatusRegistry2019'
  }),
  '@context': ['https://schema.org/givenName']
})

const testVP: IVerifiablePresentationParams = {
  id: 'urn:uuid:3978344f-8596-4c3a-a978-8fcaba3903c5',
  type: ['VerifiablePresentation'],
  verifiableCredential: [testCred],
  '@context': ['https://schema.org/givenName']
}

before(() => {
  chai.should()
  chai.use(sinonChai)
})

describe('verifiable presentation generator', function () {
  const cryptUtil = new LocalCryptUtils()
  const vcSigner = new VerifiableCredentialSigner(cryptUtil)
  const signer = new VerifiablePresentationSigner(cryptUtil, vcSigner)
  const sut = new VerifiablePresentationGenerator(signer)

  afterEach(() => {
    sinon.restore()
  })

  it('should construct properly', () => {
    const createAction = () => {
      return new VerifiablePresentationGenerator(signer)
    }
    assert.doesNotThrow(createAction)
  })

  it('should generate a valid verifiable presentation without correspondenceId', () => {
    const signModelStub = sinon.stub(signer, 'generateProofs').returns([testProof])
    const keys = [{ accountId: 0, keyId: 0 }]
    sinon.stub(signer, 'signatureType').get(() => {
      return 'SignatureType2019'
    })
    const result = sut.generateVerifiablePresentation(testVP, keys)

    const resultString = JSON.stringify(result)
    resultString.should.be.equal(`{"id":"urn:uuid:3978344f-8596-4c3a-a978-8fcaba3903c5","type":["VerifiablePresentation"],"verifiableCredential":[{"id":"did:protocol:address","type":["VerifiablePresentation"],"issuer":"did:protocol:issueraddress","issuanceDate":"${testCred.issuanceDate}","credentialSubject":{"id":"did:protocol:holderaddress","type":"John"},"proof":{"type":"Secp256k1Signature2019","created":"${testProof.created.toISOString()}","verificationMethod":"pubkey","nonce":"${testCred.proof.nonce}"},"credentialStatus":{"type":"vcStatusRegistry2019","id":"0x6AbAAFB672f60C16C604A29426aDA1Af9d96d440"},"@context":["https://schema.org/givenName"]}],"@context":["https://schema.org/givenName"],"proof":[{"type":"Secp256k1Signature2019","created":"${testProof.created.toISOString()}","verificationMethod":"pubkey","nonce":"${result.proof[0].nonce}"}]}`)
    // Asserting whether the signer was called with the exact same object and keys
    signModelStub.should.have.been.calledOnceWithExactly(testVP, keys, undefined)
  })

  it('should generate a valid verifiable presentation with a correspondenceId', () => {
    const signModelStub = sinon.stub(signer, 'generateProofs').returns([testProof])
    const keys = [{ accountId: 0, keyId: 0 }]
    sinon.stub(signer, 'signatureType').get(() => {
      return 'SignatureType2019'
    })

    sut.generateVerifiablePresentation(testVP, keys, correspondenceId)

    // Do not assert the result because that's asserted in the previous test already
    // Asserting whether the signer was called with the exact same object and keys
    signModelStub.should.have.been.calledOnceWithExactly(testVP, keys, correspondenceId)
  })
})
