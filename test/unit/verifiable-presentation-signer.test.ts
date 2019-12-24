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
import {
  CredentialStatus,
  IProofParams,
  IVerifiableCredentialParams,
  IVerifiablePresentationParams,
  VerifiableCredential,
  VerifiablePresentation
} from 'vp-toolkit-models'
import { LocalCryptUtils } from 'crypt-util'
import { VerifiableCredentialSigner, VerifiablePresentationSigner } from '../../src'

const assert = chai.assert

const testVcProof: IProofParams = {
  nonce: '43c29538-bf6a-4020-bd01-39c47c00589e',
  type: 'Secp256k1Signature2019',
  created: new Date('01-01-2019 12:34:00'),
  verificationMethod: 'pubkey',
  signatureValue: 'credentialsignature'
}

const testVpProof: IProofParams = {
  nonce: '966fb58c-c17e-4b42-b7d3-ded38e725a86',
  type: 'Secp256k1Signature2019',
  created: new Date('01-01-2019 12:34:00'),
  verificationMethod: 'pubkey',
  signatureValue: 'validSignature'
}

const testVcParams: IVerifiableCredentialParams = {
  id: 'did:protocol:address',
  type: ['VerifiableCredential'],
  issuer: 'did:protocol:issueraddress',
  issuanceDate: new Date(Date.UTC(2019, 0, 1, 12, 0, 0)),
  credentialSubject: {
    id: 'did:protocol:holderaddress',
    type: 'John'
  },
  proof: testVcProof,
  credentialStatus: new CredentialStatus({
    id: '0x6AbAAFB672f60C16C604A29426aDA1Af9d96d440',
    type: 'vcStatusRegistry2019'
  }),
  '@context': ['https://schema.org/givenName']
}

const testVc = new VerifiableCredential(testVcParams)

const testVP: IVerifiablePresentationParams = {
  id: 'urn:uuid:3978344f-8596-4c3a-a978-8fcaba3903c5',
  type: ['VerifiablePresentation'],
  verifiableCredential: [testVc],
  proof: [testVpProof],
  '@context': ['https://schema.org/givenName']
}

before(() => {
  chai.should()
  chai.use(sinonChai)
})

describe('verifiable presentation signer', function () {
  const cryptUtil = new LocalCryptUtils()
  const vcSigner = new VerifiableCredentialSigner(cryptUtil)
  const sut = new VerifiablePresentationSigner(cryptUtil, vcSigner)
  let clock: sinon.SinonFakeTimers

  beforeEach(() => {
    clock = sinon.useFakeTimers({
      now: new Date(Date.UTC(2019, 0, 1, 23, 34, 56)),
      shouldAdvanceTime: false
    })
  })

  afterEach(() => {
    clock.restore()
    sinon.restore()
  })

  it('should construct properly', () => {
    const createAction = () => {
      return new VerifiablePresentationSigner(cryptUtil, vcSigner)
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
    const expectedSignatureValue = 'signature'
    const expectedPublicKey = 'ownership-public-key'
    const cryptUtilSignStub = sinon.stub(cryptUtil, 'signPayload').returns(expectedSignatureValue)
    const cryptUtilDeriveAddrStub = sinon.stub(cryptUtil, 'deriveAddress').returns(testVc.credentialSubject.id)
    const cryptUtilDerivePubKeyStub = sinon.stub(cryptUtil, 'derivePublicKey').returns(expectedPublicKey)
    sinon.stub(cryptUtil, 'algorithmName').get(() => 'Crypt')

    const result = sut.generateProofs(testVP, [{ accountId: 0, keyId: 0 }])

    const expectedPayload = JSON.stringify(testVc) + result[0].nonce + clock.Date().toISOString()
    cryptUtilSignStub.should.have.been.calledOnceWithExactly(0, 0, expectedPayload)
    cryptUtilDeriveAddrStub.should.have.been.calledOnceWithExactly(0, 0)
    cryptUtilDerivePubKeyStub.should.have.been.calledOnceWithExactly(0, 0)
    result.should.be.deep.equal([{
      type: 'CryptSignature2019',
      created: clock.Date(),
      verificationMethod: expectedPublicKey,
      nonce: result[0].nonce,
      signatureValue: expectedSignatureValue
    }])
  })

  it('should call cryptutil, for the sign method, with the correct params for a self-signed VP', () => {
    const expectedSignatureValue = 'signature'
    const expectedPublicKey = 'ownership-public-key'
    const cryptUtilSignStub = sinon.stub(cryptUtil, 'signPayload').returns(expectedSignatureValue)
    const cryptUtilDeriveAddrStub = sinon.stub(cryptUtil, 'deriveAddress').returns(testVc.issuer)
    const cryptUtilDerivePubKeyStub = sinon.stub(cryptUtil, 'derivePublicKey').returns(expectedPublicKey)
    sinon.stub(cryptUtil, 'algorithmName').get(() => 'Crypt')

    const result = sut.generateProofs(testVP, [{ accountId: 0, keyId: 0 }]) // Self signed

    const expectedPayload = JSON.stringify(testVc) + result[0].nonce + clock.Date().toISOString()
    cryptUtilSignStub.should.have.been.calledOnceWithExactly(0, 0, expectedPayload)
    cryptUtilDeriveAddrStub.should.have.been.calledOnceWithExactly(0, 0)
    cryptUtilDerivePubKeyStub.should.have.been.calledOnceWithExactly(0, 0)
    result.should.be.deep.equal([{
      type: 'CryptSignature2019',
      created: clock.Date(),
      verificationMethod: expectedPublicKey,
      nonce: result[0].nonce,
      signatureValue: expectedSignatureValue
    }])
  })

  it('should not include proof for invalid credential', () => {
    const VpWithCreds = Object.assign({}, testVP)
    VpWithCreds.verifiableCredential = [testVc, testVc]
    const cryptUtilSignStub = sinon.stub(cryptUtil, 'signPayload')
    const cryptUtilDeriveAddrStub = sinon.stub(cryptUtil, 'deriveAddress').returns('UnknownAddress') // No match
    const cryptUtilDerivePubKeyStub = sinon.stub(cryptUtil, 'derivePublicKey')
    sinon.stub(cryptUtil, 'algorithmName').get(() => 'Crypt')

    const result = sut.generateProofs(VpWithCreds, [{ accountId: 0, keyId: 0 }])

    cryptUtilDeriveAddrStub.callCount.should.have.been.equal(2)
    cryptUtilDeriveAddrStub.should.have.been.calledWithExactly(0, 0)
    cryptUtilDerivePubKeyStub.callCount.should.have.been.equal(0)
    cryptUtilSignStub.callCount.should.have.been.equal(0)
    result.length.should.be.equal(0)
  })

  it('should succeed ownership verification with a correspondence id', () => {
    // testVpProof.nonce is the correspondenceId
    const verifiablePresentation = new VerifiablePresentation(testVP)
    sinon.stub(vcSigner, 'verifyVerifiableCredential').returns(true)
    sinon.stub(cryptUtil, 'verifyPayload').returns(true)

    const result = sut.verifyVerifiablePresentation(verifiablePresentation, false, testVpProof.nonce)

    result.should.be.equal(true)
  })

  it('should fail ownership verification with a wrong correspondence id', () => {
    // testVpProof.nonce is the correspondenceId
    const verifiablePresentation = new VerifiablePresentation(testVP)
    sinon.stub(vcSigner, 'verifyVerifiableCredential').returns(true)
    sinon.stub(cryptUtil, 'verifyPayload').returns(true)

    const result = sut.verifyVerifiablePresentation(verifiablePresentation, false, 'incorrectId')

    result.should.be.equal(false)
  })

  it('should call the appropriate dependencies (with one valid proof in VP)', () => {
    const verifiablePresentation = new VerifiablePresentation(testVP)
    const publicKey = testVpProof.verificationMethod
    const signature = testVpProof.signatureValue
    const payload = JSON.stringify(testVc) + testVpProof.nonce + testVpProof.created.toISOString()
    const vcSignerStub = sinon.stub(vcSigner, 'verifyVerifiableCredential').returns(true)
    const verifyPayloadStub = sinon.stub(cryptUtil, 'verifyPayload').returns(true)

    const result = sut.verifyVerifiablePresentation(verifiablePresentation)

    result.should.be.equal(true)
    vcSignerStub.should.have.been.calledOnceWithExactly(testVc)
    verifyPayloadStub.should.have.been.calledOnceWithExactly(payload, publicKey, signature)
  })

  it('should call the appropriate dependencies (with multiple valid proofs in VP)', () => {
    const vpWithMultipleProofs: IVerifiablePresentationParams = {
      id: 'urn:uuid:3978344f-8596-4c3a-a978-8fcaba3903c5',
      type: ['VerifiablePresentation'],
      verifiableCredential: [testVc],
      proof: [
        testVpProof,
        {
          nonce: '966fb58c-c17e-4b42-b7d3-ded38e725a86',
          type: 'Secp256k1Signature2019',
          created: new Date(Date.UTC(2019, 0, 1, 23, 0, 2)),
          verificationMethod: 'pubkey',
          signatureValue: 'secondpresentationsignature'
        }
      ],
      '@context': ['https://schema.org/givenName']
    }
    const verifiablePresentation = new VerifiablePresentation(vpWithMultipleProofs)
    const stub = sinon.stub(cryptUtil, 'verifyPayload').returns(true)

    const result = sut.verifyVerifiablePresentation(verifiablePresentation)

    result.should.be.equal(true)
    stub.callCount.should.have.been.equal(2)
  })

  it('should return false when cryptutil is failing to verify a cred. ownership', () => {
    const verifiablePresentation = new VerifiablePresentation(testVP)
    const publicKey = testVpProof.verificationMethod
    const signature = testVpProof.signatureValue
    const payload = JSON.stringify(testVc) + testVpProof.nonce + testVpProof.created.toISOString()
    const verifyPayloadStub = sinon.stub(cryptUtil, 'verifyPayload').returns(false) // Fail verify
    const vcSignerStub = sinon.stub(vcSigner, 'verifyVerifiableCredential').returns(true)

    const result = sut.verifyVerifiablePresentation(verifiablePresentation)

    result.should.be.equal(false)
    vcSignerStub.should.have.been.calledOnceWithExactly(testVc)
    verifyPayloadStub.should.have.been.calledOnceWithExactly(payload, publicKey, signature)
  })

  it('should return false when a verifiableCredential is invalid', () => {
    const verifiablePresentation = new VerifiablePresentation(testVP)
    const vcSignerStub = sinon.stub(vcSigner, 'verifyVerifiableCredential').returns(false)  // Fail verify
    const verifyPayloadStub = sinon.stub(cryptUtil, 'verifyPayload')

    const result = sut.verifyVerifiablePresentation(verifiablePresentation)

    result.should.be.equal(false)
    vcSignerStub.should.have.been.calledOnceWithExactly(testVc)
    verifyPayloadStub.callCount.should.have.been.equal(0)
  })

  it('should return false when there is no credential ownership proof provided', () => {
    const vpParams = Object.assign({}, testVP)
    vpParams.proof = []
    const vpWithoutProof = new VerifiablePresentation(vpParams)
    const vcSignerStub = sinon.stub(vcSigner, 'verifyVerifiableCredential').returns(true)
    const verifyPayloadStub = sinon.stub(cryptUtil, 'verifyPayload')

    const result = sut.verifyVerifiablePresentation(vpWithoutProof)

    result.should.be.equal(false)
    vcSignerStub.should.have.been.calledOnceWithExactly(testVc)
    verifyPayloadStub.callCount.should.have.been.equal(0)
  })

  it('should return true for a valid VC but skipped ownership check', () => {
    const verifiablePresentation = new VerifiablePresentation(testVP)
    const vcSignerStub = sinon.stub(vcSigner, 'verifyVerifiableCredential').returns(true)
    const verifyPayloadStub = sinon.stub(cryptUtil, 'verifyPayload')

    const result = sut.verifyVerifiablePresentation(verifiablePresentation, true) // skip ownership validation

    result.should.be.equal(true)
    vcSignerStub.should.have.been.calledOnceWithExactly(testVc)
    verifyPayloadStub.callCount.should.have.been.equal(0)
  })

})
