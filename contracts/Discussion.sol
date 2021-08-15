pragma solidity >=0.8.0;

contract Discussion {
  
  uint public totalTopics;
  uint public totalIdeas;
  
  mapping(uint => Topic) public topics;
  mapping(uint => Idea) public ideas;
  
  constructor() {
    totalTopics = 0;
  }

  struct Idea{
    uint id;
    uint topicId;
    string comment;
    address creator;
  }

  struct Topic{
    uint id;
    address creator;
    string title;
    uint totalTopicIdea;
  }
  

  function createTopic(string memory _title) external {
      require(bytes(_title).length > 0,"Title can Not be empty!");
      totalTopics += 1;
      Topic memory newTopic = Topic({id:totalTopics,creator:msg.sender,title:_title,totalTopicIdea:0});
      topics[totalTopics] = newTopic;
  }

  function addIdeaToTopic(uint _topicId,string memory _comment) external {
      require(_topicId <= totalTopics && _topicId>0,"Wrong topic id");

      totalIdeas += 1;

      Idea memory newIdea = Idea({id:totalIdeas,topicId:_topicId,comment:_comment,creator:msg.sender});
      ideas[totalIdeas] = newIdea;
      topics[_topicId].totalTopicIdea += 1;

  }

  function fetchTopicIdeas(uint _topicId) external view returns(Idea[] memory){    
      Idea[] memory topicIdeas = new Idea[](topics[_topicId].totalTopicIdea);
      uint currentIndex = 0;

      for(uint i=1; i<= totalIdeas;i++){
        if(ideas[i].topicId == _topicId){
            topicIdeas[currentIndex] = ideas[i];
            currentIndex +=1;
        }
      }
      return topicIdeas;
  }
  
}