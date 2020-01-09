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

import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import { IChallengeRequestParams, IProofParams } from 'vp-toolkit-models'
import { LocalCryptUtils } from 'crypt-util'
import { ChallengeRequestGenerator, ChallengeRequestSigner } from '../../src'

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

describe('challenge request generator', function () {
  const cryptUtil = new LocalCryptUtils()
  const challengeRequestSigner = new ChallengeRequestSigner(cryptUtil)
  const sut = new ChallengeRequestGenerator(challengeRequestSigner)
  const sinonTime = new Date(Date.UTC(2019, 0, 1, 23, 34, 56))
  let clock: sinon.SinonFakeTimers

  beforeEach(() => {
    clock = sinon.useFakeTimers({
      now: sinonTime,
      shouldAdvanceTime: false
    })
  })

  afterEach(() => {
    clock.restore()
    sinon.restore()
  })

  it('should construct properly', () => {
    const createAction = () => {
      return new ChallengeRequestGenerator(challengeRequestSigner)
    }
    assert.doesNotThrow(createAction)
  })

  it('should generate a valid challenge request', () => {
    const cryptUtilStub = sinon.stub(cryptUtil, 'derivePublicKey').returns(testProof.verificationMethod)
    const signModelStub = sinon.stub(challengeRequestSigner, 'signChallengeRequest').returns('testSignatureValue')
    sinon.stub(challengeRequestSigner, 'signatureType').get(() => {
      return 'SignatureType2019'
    })
    const expectedChallengeRequestParams: IChallengeRequestParams = {
      toAttest: [
        { predicate: 'https://schema.org/givenName' },
        { predicate: 'https://schema.org/familyName' }
      ],
      toVerify: [
        { predicate: 'https://schema.org/initials' }
      ],
      postEndpoint: 'https://domain.org/ssif/verifiable-presentation-endpoint',
      correspondenceId: '1e66fc69-05c6-4692-aa84-80eaacbf4bcc',
      proof: testProof
    }

    const result = sut.generateChallengeRequest(
      expectedChallengeRequestParams,
      0,
      0
    )

    // Asserting whether the result is as expected
    const resultString = JSON.stringify(result)
    const obj = JSON.parse(resultString)
    assert.deepEqual(resultString, `{"toAttest":[{"predicate":"https://schema.org/givenName"},{"predicate":"https://schema.org/familyName"}],"toVerify":[{"predicate":"https://schema.org/initials"}],"postEndpoint":"https://domain.org/ssif/verifiable-presentation-endpoint","correspondenceId":"${obj.correspondenceId}","proof":{"type":"SignatureType2019","created":"2019-01-01T23:34:56.000Z","verificationMethod":"pubkey","nonce":"${obj.proof.nonce}","signatureValue":"testSignatureValue"}}`)
    result.proof.created.should.have.been.equal(sinonTime.toISOString())
    // Asserting whether cryptUtil has been called properly to determine the verificationMethod
    cryptUtilStub.should.have.been.calledOnceWithExactly(0, 0)
    // Asserting whether ChallengeRequestSigner was called with the exact same object
    const passedChallengeRequest = signModelStub.lastCall.args[0]
    assert.deepEqual(passedChallengeRequest, result)
  })
})
