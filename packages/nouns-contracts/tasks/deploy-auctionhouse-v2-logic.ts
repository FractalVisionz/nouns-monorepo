import { task } from 'hardhat/config';
import promptjs from 'prompt';
import {
  getDeploymentConfirmationWithPrompt,
  getGasPriceWithPrompt,
  printEstimatedCost,
} from './utils';

promptjs.colors = false;
promptjs.message = '> ';
promptjs.delimiter = '';

task('deploy-auctionhouse-v2-logic', 'Deploys NounsAuctionHouseV2').setAction(
  async (_args, { ethers, run }) => {
    const factory = await ethers.getContractFactory('NounsAuctionHouseV2');

    const gasPrice = await getGasPriceWithPrompt(ethers);
    await printEstimatedCost(factory, gasPrice);

    const deployConfirmed = await getDeploymentConfirmationWithPrompt();
    if (!deployConfirmed) {
      console.log('Exiting');
      return;
    }

    console.log('Deploying...');
    const contract = await factory.deploy({ gasPrice });
    await contract.deployed();
    console.log(`Transaction hash: ${contract.deployTransaction.hash} \n`);
    console.log(`NounsAuctionHouseV2 deployed to ${contract.address}`);

    await new Promise(f => setTimeout(f, 60000));

    console.log('Verifying on Etherscan...');
    await run('verify:verify', {
      address: contract.address,
      constructorArguments: [],
    });
    console.log('Verified');
  },
);
