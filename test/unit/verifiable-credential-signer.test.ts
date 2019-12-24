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

import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import { CredentialStatus, IProofParams, IVerifiableCredentialParams, VerifiableCredential } from 'vp-toolkit-models'
import { LocalCryptUtils } from 'crypt-util'
import { VerifiableCredentialSigner } from '../../src'

const assert = chai.assert

const testProof: IProofParams = {
  type: 'Secp256k1Signature2019',
  created: new Date('01-01-2019 12:34:00'),
  verificationMethod: 'pubkey',
  signatureValue: 'abc'
}

const testCred: IVerifiableCredentialParams = {
  id: 'did:protocol:address',
  type: ['VerifiableCredential'],
  issuer: 'did:protocol:issueraddress',
  issuanceDate: new Date('01-01-2019 12:00:00'),
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
}

before(() => {
  chai.should()
  chai.use(sinonChai)
})

describe('verifiable credential signer', function () {
  const cryptUtil = new LocalCryptUtils()
  const sut = new VerifiableCredentialSigner(cryptUtil)

  afterEach(() => {
    sinon.restore()
  })

  it('should construct properly', () => {
    const createAction = () => {
      return new VerifiableCredentialSigner(cryptUtil)
    }
    assert.doesNotThrow(createAction)
  })

  it('should return hardcoded signatureType', () => {
    sinon.stub(cryptUtil, 'algorithmName').get(() => {
      return 'secp256k1'
    })
    assert.equal(sut.signatureType, 'secp256k1Signature2019')
  })

  it('should return an unchanged cryptUtil instance', () => {
    assert.deepEqual(sut.cryptUtil, cryptUtil)
  })

  it('should call cryptutil, for the sign method, with the correct params', () => {
    const verifiableCredential = new VerifiableCredential(testCred)
    const expectedSignatureValue = 'signature'
    const vcWithoutSig = new VerifiableCredential(verifiableCredential.toJSON() as IVerifiableCredentialParams)
    vcWithoutSig.proof.signatureValue = undefined
    const stub = sinon.stub(cryptUtil, 'signPayload').returns(expectedSignatureValue)

    const result = sut.signVerifiableCredential(verifiableCredential, 0, 0)

    result.should.be.equal(expectedSignatureValue)
    stub.should.have.been.calledOnceWithExactly(0, 0, JSON.stringify(vcWithoutSig))
  })

  it('should call cryptutil, for the verify method, with the correct params', () => {
    const verifiableCredential = new VerifiableCredential(testCred)
    const publicKey = verifiableCredential.proof.verificationMethod
    const signature = String(verifiableCredential.proof.signatureValue)
    const vcWithoutSig = new VerifiableCredential(verifiableCredential.toJSON() as IVerifiableCredentialParams)
    vcWithoutSig.proof.signatureValue = undefined
    const expectedPayload = JSON.stringify(vcWithoutSig)
    const stub = sinon.stub(cryptUtil, 'verifyPayload').returns(true)

    const result = sut.verifyVerifiableCredential(verifiableCredential)

    result.should.be.equal(true)
    stub.should.have.been.calledOnceWithExactly(expectedPayload, publicKey, signature)
  })

  it('should return false when cryptutil is failing to verify', () => {
    const verifiableCredential = new VerifiableCredential(testCred)
    const publicKey = verifiableCredential.proof.verificationMethod
    const signature = String(verifiableCredential.proof.signatureValue)
    const vcWithoutSig = new VerifiableCredential(verifiableCredential.toJSON() as IVerifiableCredentialParams)
    vcWithoutSig.proof.signatureValue = undefined
    const expectedPayload = JSON.stringify(vcWithoutSig)
    const stub = sinon.stub(cryptUtil, 'verifyPayload').returns(false) // Fail here

    const vcSigner = new VerifiableCredentialSigner(cryptUtil)
    const result = vcSigner.verifyVerifiableCredential(verifiableCredential)
    result.should.be.equal(false)

    return stub.should.have.been.calledOnceWithExactly(expectedPayload, publicKey, signature)
  })
})
