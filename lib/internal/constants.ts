const Build = {
  Default: "Default",
  Test: "Test",
  TestAndHonorNodeEnv: "TestAndHonorNodeEnv",
} as const;

const Delimiter = "." as const;

const Env = {
  Default: "default",
  Development: "development",
  Test: "test",
} as const;

export {
  Build,
  Delimiter,
  Env,
};
