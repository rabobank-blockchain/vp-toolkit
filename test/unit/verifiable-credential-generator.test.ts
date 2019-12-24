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
import { CredentialStatus, IProofParams, IVerifiableCredentialParams } from 'vp-toolkit-models'
import { LocalCryptUtils } from 'crypt-util'
import { VerifiableCredentialGenerator, VerifiableCredentialSigner } from '../../src'

const assert = chai.assert

const testProof: IProofParams = {
  type: 'Secp256k1Signature2019',
  created: new Date('01-01-2019 12:34:00'),
  verificationMethod: 'pubkey'
}

const testCredParams: IVerifiableCredentialParams = {
  id: 'did:protocol:address',
  type: ['VerifiableCredential'],
  issuer: 'did:protocol:issueraddress',
  issuanceDate: new Date(Date.UTC(2019, 0, 1, 15, 2, 42)),
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

describe('verifiable credential generator', function () {
  const cryptUtil = new LocalCryptUtils()
  const signer = new VerifiableCredentialSigner(cryptUtil)
  const sut = new VerifiableCredentialGenerator(signer)
  let clock: sinon.SinonFakeTimers

  beforeEach(() => {
    clock = sinon.useFakeTimers({
      now: new Date(Date.UTC(2019, 0, 1, 4, 8, 50)),
      shouldAdvanceTime: false
    })
  })

  afterEach(() => {
    clock.restore()
    sinon.restore()
  })

  it('should construct properly', () => {
    const createAction = () => {
      return new VerifiableCredentialGenerator(signer)
    }
    assert.doesNotThrow(createAction)
  })

  it('should generate a valid verifiable credential', () => {
    const cryptUtilStub = sinon.stub(cryptUtil, 'derivePublicKey').returns(testProof.verificationMethod)
    const signModelStub = sinon.stub(signer, 'signVerifiableCredential').returns('testSignatureValue')
    sinon.stub(signer, 'signatureType').get(() => {
      return 'SignatureType2019'
    })
    const result = sut.generateVerifiableCredential(
      testCredParams,
      0,
      0
    )

    // Asserting whether the result is as expected
    const resultString = JSON.stringify(result)
    resultString.should.be.equal(`{"id":"did:protocol:address","type":["VerifiableCredential"],"issuer":"did:protocol:issueraddress","issuanceDate":"${testCredParams.issuanceDate.toISOString()}","credentialSubject":{"id":"did:protocol:holderaddress","type":"John"},"proof":{"type":"SignatureType2019","created":"${clock.Date().toISOString()}","verificationMethod":"pubkey","nonce":"${result.proof.nonce}","signatureValue":"testSignatureValue"},"credentialStatus":{"type":"vcStatusRegistry2019","id":"0x6AbAAFB672f60C16C604A29426aDA1Af9d96d440"},"@context":["https://schema.org/givenName"]}`)

    result.proof.created.should.have.been.equal(clock.Date().toISOString())
    // Asserting whether cryptUtil has been called properly to determine the verificationMethod
    cryptUtilStub.should.have.been.calledOnceWithExactly(0, 0)
    // Asserting whether ChallengeRequestSigner was called with the exact same object
    const passedChallengeRequest = signModelStub.lastCall.args[0]
    assert.deepEqual(passedChallengeRequest, result)
  })
})
