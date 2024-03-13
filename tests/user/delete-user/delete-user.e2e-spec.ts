import { UserResponseDto } from '@modules/user/dtos/user.response.dto';
import { IdResponse } from '@src/libs/api/id.response.dto';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { TestContext } from '@tests/test-utils/TestContext';
import {
  CreateUserTestContext,
  givenUserProfileData,
  iSendARequestToCreateAUser,
} from '../user-shared-steps';
import { ApiClient } from '@tests/test-utils/ApiClient';

const feature = loadFeature('tests/user/delete-user/delete-user.feature');

defineFeature(feature, (test) => {
  const apiClient = new ApiClient();

  test('I can delete a user', ({ given, when, then, and }) => {
    const ctx = new TestContext<CreateUserTestContext>();

    givenUserProfileData(given, ctx);

    iSendARequestToCreateAUser(when, ctx);

    then('I send a request to delete my user', async () => {
      const response = ctx.latestResponse as IdResponse;
      await apiClient.deleteUser(response.id);
    });

    and('I cannot see my user in a list of all users', async () => {
      const res = await apiClient.findAllUsers();
      const response = ctx.latestResponse as IdResponse;
      expect(
        res.data.some((item: UserResponseDto) => item.id === response.id),
      ).toBe(false);
    });
  });
});
