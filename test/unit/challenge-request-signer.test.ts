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
import { ChallengeRequest, IProofParams } from 'vp-toolkit-models'
import { LocalCryptUtils } from 'crypt-util'
import { ChallengeRequestSigner } from '../../src'

const assert = chai.assert

const testProof: IProofParams = {
  type: 'Secp256k1Signature2019',
  created: new Date('01-01-2019 12:34:00'),
  verificationMethod: 'pubkey'
}

before(() => {
  chai.should()
  chai.use(sinonChai)
})

describe('challenge request signer', function () {
  const cryptUtil = new LocalCryptUtils()
  const sut = new ChallengeRequestSigner(cryptUtil)

  afterEach(() => {
    sinon.restore()
  })

  it('should construct properly', () => {
    const createAction = () => {
      return new ChallengeRequestSigner(cryptUtil)
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
    const challengeRequest = new ChallengeRequest({
      toAttest: [{ predicate: 'https://schema.org/familyName' }],
      toVerify: [{ predicate: 'https://schema.org/initials' }],
      proof: testProof
    })
    const expectedSignatureValue = 'signature'
    const stub = sinon.stub(cryptUtil, 'signPayload').returns(expectedSignatureValue)

    const result = sut.signChallengeRequest(challengeRequest, 0, 0)

    result.should.be.equal(expectedSignatureValue)
    stub.should.have.been.calledOnceWithExactly(0, 0, JSON.stringify(challengeRequest))
  })

  it('should call cryptutil, for the verify method, with the correct params', () => {
    const challengeRequest = new ChallengeRequest({
      toAttest: [{ predicate: 'https://schema.org/familyName' }],
      toVerify: [{ predicate: 'https://schema.org/initials' }],
      proof: testProof
    })
    const publicKey = challengeRequest.proof.verificationMethod
    const signature = String(challengeRequest.proof.signatureValue)
    const payload = JSON.stringify(challengeRequest).replace(signature, '')
    const stub = sinon.stub(cryptUtil, 'verifyPayload').returns(true)

    const result = sut.verifyChallengeRequest(challengeRequest)

    result.should.be.equal(true)
    stub.should.have.been.calledOnceWithExactly(payload, publicKey, signature)
  })

  it('should fail verification if cryptutil returns false', () => {
    const challengeRequest = new ChallengeRequest({
      toAttest: [{ predicate: 'https://schema.org/familyName' }],
      toVerify: [{ predicate: 'https://schema.org/initials' }],
      proof: testProof
    })
    const publicKey = challengeRequest.proof.verificationMethod
    const signature = String(challengeRequest.proof.signatureValue)
    const payload = JSON.stringify(challengeRequest)
    const stub = sinon.stub(cryptUtil, 'verifyPayload').returns(false) // Fail here

    const result = sut.verifyChallengeRequest(challengeRequest)

    result.should.be.equal(false)
    stub.should.have.been.calledOnceWithExactly(payload, publicKey, signature)
  })

})
