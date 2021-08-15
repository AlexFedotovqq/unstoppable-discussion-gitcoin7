import Web3 from 'web3';
import * as DiscussionJSON from '../../../build/contracts/Discussion.json';
import { Discussion } from '../../types/Discussion';
import { DEPLOYED_CONTRACT_ADDRESS } from '../../ui/utils';

const DEFAULT_SEND_OPTIONS = {
    gas: 6000000
};

export class DiscussionWrapper {
    web3: Web3;

    contract: Discussion;

    address: string;

    constructor(web3: Web3) {
        this.web3 = web3;
        this.address = DEPLOYED_CONTRACT_ADDRESS;
        this.contract = new web3.eth.Contract(DiscussionJSON.abi as any) as any;

        this.contract.options.address = DEPLOYED_CONTRACT_ADDRESS;
    }

    get isDeployed() {
        return Boolean(this.address);
    }

    async getTotalTopic(fromAddress: string) {
        const totalTopic = await this.contract.methods.totalTopics().call({ from: fromAddress });
        return totalTopic;
    }

    async getTopic(topcId: number, fromAddress: string) {
        const topicIdeas = await this.contract.methods.topics(topcId).call({ from: fromAddress });

        return topicIdeas;
    }

    async fetchTopicIdeas(topcId: number, fromAddress: string) {
        const topicIdeas = await this.contract.methods
            .fetchTopicIdeas(topcId)
            .call({ from: fromAddress });

        return topicIdeas;
    }

    async createTopic(title: string, fromAddress: string) {
        const tx = await this.contract.methods.createTopic(title).send({
            ...DEFAULT_SEND_OPTIONS,
            from: fromAddress
        });

        return tx;
    }

    async addIdeaToTopic(topicId: number, comment: string, fromAddress: string) {
        const tx = await this.contract.methods.addIdeaToTopic(topicId, comment).send({
            ...DEFAULT_SEND_OPTIONS,
            from: fromAddress
        });

        return tx;
    }
}
