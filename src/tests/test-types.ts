export type MockChrome = {
  runtime: {
    id: string
  }
  storage: {
    [x: string]: any
    sync: {
      get: sinon.SinonStub
    }
  }
  tabs: {
    update: sinon.SinonSpy
  }
}

export type TestContext = {
  affiliateId: string
}
